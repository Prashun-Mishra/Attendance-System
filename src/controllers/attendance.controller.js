const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, status } = req.body;

        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if attendance already marked for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                studentId: studentId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                studentId,
                status: status || 'Present',
            },
        });

        res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.exportAttendance = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const attendanceRecords = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                student: true,
            },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Time', key: 'time', width: 15 },
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Roll No', key: 'rollNo', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
        ];

        attendanceRecords.forEach((record) => {
            const recordDate = new Date(record.date);
            worksheet.addRow({
                date: recordDate.toLocaleDateString(),
                time: recordDate.toLocaleTimeString(),
                name: record.student.fullName,
                rollNo: record.student.rollNo,
                status: record.status,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting attendance:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
