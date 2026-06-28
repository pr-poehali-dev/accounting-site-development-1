import json
import os
import hashlib
import secrets
import smtplib
from email.mime.text import MIMEText
import psycopg2


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode('utf-8')).hexdigest()


def db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ensure_seed(conn):
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM admins")
    if cur.fetchone()[0] == 0:
        cur.execute(
            "INSERT INTO admins (login, email, password_hash) VALUES (%s, %s, %s)",
            ('admin', 'info@sala-consult.ru', hash_pw('salaconsult2026'))
        )
        conn.commit()
    cur.close()


def send_email_to_admins(conn, req):
    host = os.environ.get('SMTP_HOST')
    user = os.environ.get('SMTP_USER')
    password = os.environ.get('SMTP_PASSWORD')
    if not (host and user and password):
        return
    cur = conn.cursor()
    cur.execute("SELECT email FROM admins")
    emails = [r[0] for r in cur.fetchall()]
    cur.close()
    if not emails:
        return
    text = (
        f"Новая заявка с сайта Сала-Консалт\n\n"
        f"Имя: {req['name']}\n"
        f"Телефон: {req['phone']}\n"
        f"Цена: {req.get('price') or '—'}\n"
        f"Комментарий: {req.get('comment') or '—'}\n"
    )
    msg = MIMEText(text, 'plain', 'utf-8')
    msg['Subject'] = 'Новая заявка — Сала-Консалт'
    msg['From'] = user
    msg['To'] = ', '.join(emails)
    try:
        with smtplib.SMTP_SSL(host, int(os.environ.get('SMTP_PORT', '465'))) as s:
            s.login(user, password)
            s.sendmail(user, emails, msg.as_string())
    except Exception:
        pass


def auth_admin(conn, headers):
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return None
    cur = conn.cursor()
    cur.execute(
        "SELECT a.id, a.login, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.token = %s",
        (token,)
    )
    row = cur.fetchone()
    cur.close()
    if not row:
        return None
    return {'id': row[0], 'login': row[1], 'email': row[2]}


def resp(status, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        },
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str, ensure_ascii=False),
    }


def handler(event, context):
    '''Управление заявками и админ-панелью: приём заявок, вход, список заявок, управление администраторами.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return resp(200, {})

    headers = event.get('headers') or {}
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    conn = db()
    ensure_seed(conn)

    # --- Public: create request ---
    if method == 'POST' and action == 'create_request':
        name = (body.get('name') or '').strip()
        phone = (body.get('phone') or '').strip()
        if not name or not phone:
            conn.close()
            return resp(400, {'error': 'Имя и телефон обязательны'})
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO requests (name, phone, price, comment) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, phone, body.get('price'), body.get('comment'))
        )
        conn.commit()
        cur.close()
        send_email_to_admins(conn, {'name': name, 'phone': phone, 'price': body.get('price'), 'comment': body.get('comment')})
        conn.close()
        return resp(200, {'success': True})

    # --- Public: login ---
    if method == 'POST' and action == 'login':
        login = (body.get('login') or '').strip()
        password = body.get('password') or ''
        cur = conn.cursor()
        cur.execute("SELECT id FROM admins WHERE login = %s AND password_hash = %s", (login, hash_pw(password)))
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return resp(401, {'error': 'Неверный логин или пароль'})
        token = secrets.token_hex(32)
        cur.execute("INSERT INTO sessions (token, admin_id) VALUES (%s, %s)", (token, row[0]))
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'token': token})

    # --- All below require auth ---
    admin = auth_admin(conn, headers)
    if not admin:
        conn.close()
        return resp(401, {'error': 'Требуется авторизация'})

    if method == 'GET' and action == 'requests':
        cur = conn.cursor()
        cur.execute("SELECT id, name, phone, price, comment, status, created_at FROM requests ORDER BY created_at DESC")
        items = [
            {'id': r[0], 'name': r[1], 'phone': r[2], 'price': r[3], 'comment': r[4], 'status': r[5], 'created_at': r[6]}
            for r in cur.fetchall()
        ]
        cur.close()
        conn.close()
        return resp(200, {'requests': items, 'me': admin})

    if method == 'GET' and action == 'admins':
        cur = conn.cursor()
        cur.execute("SELECT id, login, email, created_at FROM admins ORDER BY id")
        items = [{'id': r[0], 'login': r[1], 'email': r[2], 'created_at': r[3]} for r in cur.fetchall()]
        cur.close()
        conn.close()
        return resp(200, {'admins': items})

    if method == 'POST' and action == 'add_admin':
        login = (body.get('login') or '').strip()
        email = (body.get('email') or '').strip()
        password = body.get('password') or ''
        if not login or not email or not password:
            conn.close()
            return resp(400, {'error': 'Все поля обязательны'})
        cur = conn.cursor()
        cur.execute("SELECT id FROM admins WHERE login = %s", (login,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return resp(400, {'error': 'Логин уже занят'})
        cur.execute(
            "INSERT INTO admins (login, email, password_hash) VALUES (%s, %s, %s)",
            (login, email, hash_pw(password))
        )
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'success': True})

    if method == 'PUT' and action == 'update_request':
        rid = body.get('id')
        status = body.get('status')
        cur = conn.cursor()
        cur.execute("UPDATE requests SET status = %s WHERE id = %s", (status, rid))
        conn.commit()
        cur.close()
        conn.close()
        return resp(200, {'success': True})

    conn.close()
    return resp(400, {'error': 'Неизвестное действие'})
