import apiClient from '@/lib/api';

export interface AlgorithmSchedule {
  hours: number;
  minutes: number;
}

export interface AlgorithmSchedules {
  clustering: AlgorithmSchedule;
  genetic_algorithm: AlgorithmSchedule;
  reverse_genetic_algorithm: AlgorithmSchedule;
}

class AlgorithmScheduleService {
  async getSchedules(): Promise<AlgorithmSchedules> {
    const response = await apiClient.get('/admin/algorithm-schedules');
    return response.data.data;
  }

  async updateSchedule(algorithmType: string, scheduleHours: number, scheduleMinutes: number): Promise<void> {
    await apiClient.put(`/admin/algorithm-schedules/${algorithmType}`, {
      schedule_hours: scheduleHours,
      schedule_minutes: scheduleMinutes
    });
  }
}

export default new AlgorithmScheduleService();

