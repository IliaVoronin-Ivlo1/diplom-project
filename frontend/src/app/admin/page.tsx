'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import adminService, { User } from '@/services/admin.service';
import algorithmScheduleService, { AlgorithmSchedules } from '@/services/algorithm-schedule.service';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import AdminBackground from '@/components/AdminBackground/AdminBackground';
import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import styles from './admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [schedules, setSchedules] = useState<AlgorithmSchedules>({
    clustering: { hours: 6, minutes: 1 },
    genetic_algorithm: { hours: 6, minutes: 1 },
    reverse_genetic_algorithm: { hours: 6, minutes: 1 }
  });
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (!authenticated) {
      router.push('/login');
      return;
    }

    checkAdminAndLoadUsers();
  }, [router]);

  useEffect(() => {
    if (isAdmin && activeSection === 'users') {
      loadUsers(currentPage);
    }
    if (isAdmin && activeSection === 'algorithms-time') {
      loadSchedules();
    }
  }, [currentPage, isAdmin, activeSection]);

  const checkAdminAndLoadUsers = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user.role === 'Admin') {
        setIsAdmin(true);
        if (activeSection === 'users') {
          loadUsers(1);
        }
      } else {
        router.push('/profile');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (page: number) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadSchedules = async () => {
    try {
      setSchedulesLoading(true);
      const data = await algorithmScheduleService.getSchedules();
      setSchedules(data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/profile');
      }
    } finally {
      setSchedulesLoading(false);
    }
  };

  const handleScheduleUpdate = async (algorithmType: string, hours: number, minutes: number) => {
    try {
      await algorithmScheduleService.updateSchedule(algorithmType, hours, minutes);
      setSchedules((prev: AlgorithmSchedules) => ({
        ...prev,
        [algorithmType]: { hours, minutes }
      }));
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/profile');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      authService.removeToken();
      router.push('/login');
    } catch (error) {
      authService.removeToken();
      router.push('/login');
    }
  };

  if (isAuthenticated === null || loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', paddingTop: '100px', color: 'var(--text-secondary)' }}>
          Загрузка...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      <AdminBackground />
      <ProfileHeader onLogout={handleLogout} />
      <div className={styles.content}>
        <div className={styles.layout}>
          <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          
          <div className={styles.mainContent}>
            {activeSection === 'users' && (
              <>
                <div className={styles.usersTable}>
          <div className={styles.tableHeader}>
            <div className={styles.tableHeaderCell}>ID</div>
            <div className={styles.tableHeaderCell}>Имя</div>
            <div className={styles.tableHeaderCell}>Email</div>
            <div className={styles.tableHeaderCell}>Роль</div>
            <div className={styles.tableHeaderCell}>Email подтвержден</div>
            <div className={styles.tableHeaderCell}>Дата регистрации</div>
          </div>

          {users.length === 0 ? (
            <div className={styles.emptyState}>
              Пользователи не найдены
            </div>
          ) : (
            <>
              {users.map((user) => (
                <div key={user.id} className={styles.tableRow}>
                  <div className={styles.tableCell}>{user.id}</div>
                  <div className={styles.tableCell}>{user.name || '-'}</div>
                  <div className={styles.tableCell}>{user.email}</div>
                  <div className={styles.tableCell}>
                    <span className={styles.roleBadge}>{user.role}</span>
                  </div>
                  <div className={styles.tableCell}>
                    {user.email_verified_at ? (
                      <span className={styles.verified}>Да</span>
                    ) : (
                      <span className={styles.notVerified}>Нет</span>
                    )}
                  </div>
                  <div className={styles.tableCell}>
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {pagination && pagination.last_page > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Назад
            </button>
            
            <div className={styles.paginationInfo}>
              Страница {pagination.current_page} из {pagination.last_page}
            </div>

            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.last_page}
            >
              Вперед
            </button>
          </div>
        )}
              </>
            )}

            {activeSection === 'algorithms-time' && (
              <div className={styles.sectionContent}>
                <div className={styles.schedulesTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.tableHeaderCell}>Алгоритм</div>
                    <div className={styles.tableHeaderCell}>Часы</div>
                    <div className={styles.tableHeaderCell}>Минуты</div>
                    <div className={styles.tableHeaderCell}>Действия</div>
                  </div>

                  {schedulesLoading ? (
                    <div className={styles.emptyState}>
                      Загрузка...
                    </div>
                  ) : (
                    <>
                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>Кластеризация</div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            value={schedules.clustering.hours}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, clustering: { ...prev.clustering, hours: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            max="59"
                            value={schedules.clustering.minutes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, clustering: { ...prev.clustering, minutes: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleScheduleUpdate('clustering', schedules.clustering.hours, schedules.clustering.minutes)}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>Рейтинг поставщиков</div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            value={schedules.genetic_algorithm.hours}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, genetic_algorithm: { ...prev.genetic_algorithm, hours: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            max="59"
                            value={schedules.genetic_algorithm.minutes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, genetic_algorithm: { ...prev.genetic_algorithm, minutes: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleScheduleUpdate('genetic_algorithm', schedules.genetic_algorithm.hours, schedules.genetic_algorithm.minutes)}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>Рейтинг автозапчастей</div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            value={schedules.reverse_genetic_algorithm.hours}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, reverse_genetic_algorithm: { ...prev.reverse_genetic_algorithm, hours: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            max="59"
                            value={schedules.reverse_genetic_algorithm.minutes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, reverse_genetic_algorithm: { ...prev.reverse_genetic_algorithm, minutes: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleScheduleUpdate('reverse_genetic_algorithm', schedules.reverse_genetic_algorithm.hours, schedules.reverse_genetic_algorithm.minutes)}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'algorithms-stats' && (
              <div className={styles.sectionContent}>
                <div className={styles.placeholder}>
                  Контент будет добавлен позже
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

