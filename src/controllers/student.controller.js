const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createStudent = async (req, res) => {
    try {
        const { fullName, rollNo, faceDescriptor } = req.body;

        // Check if student already exists
        const existingStudent = await prisma.student.findUnique({
            where: { rollNo },
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this Roll No already exists' });
        }

        const student = await prisma.student.create({
            data: {
                fullName,
                rollNo,
                faceDescriptor: JSON.stringify(faceDescriptor), // Verify format
            },
        });

        res.status(201).json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const students = await prisma.student.findMany();
        // Parse faceDescriptor back to JSON
        const formattedStudents = students.map(s => ({
            ...s,
            faceDescriptor: JSON.parse(s.faceDescriptor)
        }));
        res.json(formattedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
