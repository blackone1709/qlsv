from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '123456'
app.config['MYSQL_DB'] = 'qlsv'
app.config['MYSQL_HOST'] = 'localhost'
mysql = MySQL(app)

@app.route('/add_student', methods=['POST'])
def add_student():
    data = request.json
    ten_sinh_vien = data['name']
    ma_sinh_vien = data['studentId']
    ngay_sinh = data['dob']
    lop = data['class']
    diem = data['score']
    nganh_hoc = data['major']

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO sinh_vien (ten_sinh_vien, ma_sinh_vien, ngay_sinh, lop, diem, nganh_hoc) VALUES (%s, %s, %s, %s, %s, %s)",
        (ten_sinh_vien, ma_sinh_vien, ngay_sinh, lop, diem, nganh_hoc)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({'status': 'success'})

@app.route('/students', methods=['GET'])
def get_students():
    cur = mysql.connection.cursor()
    cur.execute("SELECT ma_sinh_vien, ten_sinh_vien, ngay_sinh, lop, diem, nganh_hoc FROM sinh_vien")
    rows = cur.fetchall()
    cur.close()

    students = []
    for row in rows:
        students.append({
            'studentId': row[0],
            'name': row[1],
            'dob': str(row[2]),
            'class': row[3],
            'score': row[4],
            'major': row[5]
        })
    return jsonify(students)
# Xóa sinh viên
@app.route('/delete_student/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM sinh_vien WHERE ma_sinh_vien = %s", (student_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({'status': 'success'})

# Lấy thông tin 1 sinh viên
@app.route('/student/<student_id>', methods=['GET'])
def get_student(student_id):
    cur = mysql.connection.cursor()
    cur.execute("SELECT ma_sinh_vien, ten_sinh_vien, ngay_sinh, lop, diem, nganh_hoc FROM sinh_vien WHERE ma_sinh_vien = %s", (student_id,))
    row = cur.fetchone()
    cur.close()
    if row:
        return jsonify({
            'studentId': row[0],
            'name': row[1],
            'dob': str(row[2]),
            'class': row[3],
            'score': row[4],
            'major': row[5]
        })
    return jsonify({}), 404

# Cập nhật sinh viên
@app.route('/update_student/<student_id>', methods=['PUT'])
def update_student(student_id):
    data = request.json
    cur = mysql.connection.cursor()
    cur.execute(
        "UPDATE sinh_vien SET ten_sinh_vien=%s, ngay_sinh=%s, lop=%s, diem=%s, nganh_hoc=%s WHERE ma_sinh_vien=%s",
        (data['name'], data['dob'], data['class'], data['score'], data['major'], student_id)
    )
    mysql.connection.commit()
    cur.close()
    return jsonify({'status': 'success'})
if __name__ == '__main__':
    app.run(debug=True)
