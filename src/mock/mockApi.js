import { mockPatients, mockAppointments, mockUsers } from './mockData';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
    // Patient APIs
    async getPatients(params = {}) {
        await delay(500);
        const { search = '', offset = 0, limit = 50 } = params;

        let filteredPatients = mockPatients;
        if (search) {
            filteredPatients = mockPatients.filter(patient =>
                patient.name1.includes(search) ||
                patient.surname.includes(search) ||
                patient.patient_id.includes(search) ||
                patient.hncode.includes(search)
            );
        }

        return {
            result: true,
            data: filteredPatients.slice(offset, offset + limit)
        };
    },

    async addPatient(patientData) {
        await delay(800);
        const newPatient = {
            ...patientData,
            id: mockPatients.length + 1,
            patient_id: `P24062${String(mockPatients.length + 1).padStart(3, '0')}`,
            hncode: `HN${String(mockPatients.length + 1).padStart(6, '0')}`,
            createdAt: new Date().toISOString()
        };
        mockPatients.push(newPatient);
        return {
            result: true,
            message: 'Patient created successfully',
            data: newPatient
        };
    },

    async updatePatient(patientData) {
        await delay(600);
        const index = mockPatients.findIndex(p => p.patient_id === patientData.patient_id);
        if (index !== -1) {
            mockPatients[index] = { ...mockPatients[index], ...patientData };
            return {
                result: true,
                message: 'Patient updated successfully'
            };
        }
        return {
            result: false,
            message: 'Patient not found'
        };
    },

    async deletePatient(patient_id) {
        await delay(500);
        const index = mockPatients.findIndex(p => p.patient_id === patient_id);
        if (index !== -1) {
            mockPatients.splice(index, 1);
            return {
                result: true,
                message: 'Patient deleted successfully'
            };
        }
        return {
            result: false,
            message: 'Patient not found'
        };
    },

    // Appointment APIs
    async getAppointments(params = {}) {
        await delay(500);
        return {
            result: true,
            data: mockAppointments
        };
    },

    async addAppointment(appointmentData) {
        await delay(800);
        const newAppointment = {
            ...appointmentData,
            id: mockAppointments.length + 1,
            appointment_id: `A24062${String(mockAppointments.length + 1).padStart(3, '0')}`,
            createdAt: new Date().toISOString()
        };
        mockAppointments.push(newAppointment);
        return {
            result: true,
            message: 'Appointment created successfully',
            data: newAppointment
        };
    }
};