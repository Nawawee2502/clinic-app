export const mockPatients = [
    {
        id: 1,
        patient_id: "P24062001",
        hncode: "HN000001",
        name1: "สมชาย",
        surname: "ใจดี",
        prename: "นาย",
        sex: "ชาย",
        age: 34,
        tel1: "081-234-5678",
        email1: "somchai@email.com",
        bdate: "1990-01-15",
        addr1: "123 หมู่ 1 ตำบลบ่อยาง",
        createdAt: "2024-06-20T10:30:00Z"
    },
    {
        id: 2,
        patient_id: "P24062002",
        hncode: "HN000002",
        name1: "สมหญิง",
        surname: "รักดี",
        prename: "นางสาว",
        sex: "หญิง",
        age: 28,
        tel1: "081-456-7890",
        email1: "somying@email.com",
        bdate: "1996-03-20",
        addr1: "456 หมู่ 2 ตำบลบ่อยาง",
        createdAt: "2024-06-20T11:00:00Z"
    }
];

export const mockAppointments = [
    {
        id: 1,
        appointment_id: "A24062001",
        patient_id: "P24062001",
        appointment_date: "2024-06-21",
        appointment_time: "09:30:00",
        status: "scheduled",
        appointment_type: "ตรวจรักษาทั่วไป",
        chief_complaint: "ปวดหัด",
        patient: {
            name1: "สมชาย",
            surname: "ใจดี",
            tel1: "081-234-5678"
        }
    },
    {
        id: 2,
        appointment_id: "A24062002",
        patient_id: "P24062002",
        appointment_date: "2024-06-21",
        appointment_time: "10:00:00",
        status: "confirmed",
        appointment_type: "ตรวจรักษาทั่วไป",
        chief_complaint: "ตรวจสุขภาพ",
        patient: {
            name1: "สมหญิง",
            surname: "รักดี",
            tel1: "081-456-7890"
        }
    }
];

export const mockUsers = [
    {
        user_id: 1,
        first_name: "นพ.สมเกียรติ",
        last_name: "ใจเย็น",
        role: "doctor",
        specialization: "อายุรกรรม"
    }
];