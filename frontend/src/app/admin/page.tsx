'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import adminService, { User } from '@/services/admin.service';
import algorithmScheduleService, { AlgorithmSchedules } from '@/services/algorithm-schedule.service';
import analysisHistoryService, { AnalysisHistoryItem, AnalysisHistoryPagination } from '@/services/analysis-history.service';
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
    reverse_genetic_algorithm: { hours: 6, minutes: 1 },
    seasonality_analysis: { hours: 6, minutes: 1 }
  });
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [historyData, setHistoryData] = useState<AnalysisHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDate, setHistoryDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPagination, setHistoryPagination] = useState<AnalysisHistoryPagination | null>(null);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('');
  const [historyAlgorithmFilter, setHistoryAlgorithmFilter] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingRole, setEditingRole] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

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
      loadHistory();
    }
  }, [currentPage, isAdmin, activeSection]);

  useEffect(() => {
    if (isAdmin && activeSection === 'algorithms-time') {
      setHistoryPage(1);
    }
  }, [historyDate, historyStatusFilter, historyAlgorithmFilter, isAdmin, activeSection]);

  useEffect(() => {
    if (isAdmin && activeSection === 'algorithms-time') {
      loadHistory();
    }
  }, [historyDate, historyPage, historyStatusFilter, historyAlgorithmFilter, isAdmin, activeSection]);

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

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditingName(user.name || '');
    setEditingRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingName('');
    setEditingRole('');
  };

  const handleSaveUser = async (userId: number) => {
    try {
      setSaving(true);
      const response = await adminService.updateUser(userId, {
        name: editingName || undefined,
        role: editingRole
      });
      
      setUsers(users.map(user => 
        user.id === userId ? response.data : user
      ));
      setEditingUserId(null);
      setEditingName('');
      setEditingRole('');
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/profile');
      } else {
        alert('Ошибка при сохранении пользователя');
      }
    } finally {
      setSaving(false);
    }
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

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const status = historyStatusFilter || undefined;
      const algorithmName = historyAlgorithmFilter || undefined;
      const response = await analysisHistoryService.getHistory(historyDate, historyPage, status, algorithmName);
      setHistoryData(response.data);
      setHistoryPagination(response.pagination);
    } catch (error: any) {
      if (error.response?.status === 403) {
        router.push('/profile');
      }
      setHistoryData([]);
      setHistoryPagination(null);
    } finally {
      setHistoryLoading(false);
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
            <div className={styles.tableHeaderCell}>Действия</div>
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
                  <div className={styles.tableCell}>
                    {editingUserId === user.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={styles.editInput}
                        placeholder="Имя"
                      />
                    ) : (
                      user.name || '-'
                    )}
                  </div>
                  <div className={styles.tableCell}>{user.email}</div>
                  <div className={styles.tableCell}>
                    {editingUserId === user.id ? (
                      <select
                        value={editingRole}
                        onChange={(e) => setEditingRole(e.target.value)}
                        className={styles.editSelect}
                      >
                        <option value="Visiter">Visiter</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                      </select>
                    ) : (
                      <span className={styles.roleBadge}>{user.role}</span>
                    )}
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
                  <div className={styles.tableCell}>
                    {editingUserId === user.id ? (
                      <div className={styles.editActions}>
                        <button
                          className={styles.saveButton}
                          onClick={() => handleSaveUser(user.id)}
                          disabled={saving}
                        >
                          {saving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button
                          className={styles.cancelButton}
                          onClick={handleCancelEdit}
                          disabled={saving}
                        >
                          Отмена
                        </button>
                      </div>
                    ) : (
                      <button
                        className={styles.editButton}
                        onClick={() => handleEditUser(user)}
                      >
                        Редактировать
                      </button>
                    )}
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

                      <div className={styles.tableRow}>
                        <div className={styles.tableCell}>Анализ сезонности</div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            value={schedules.seasonality_analysis.hours}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, seasonality_analysis: { ...prev.seasonality_analysis, hours: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <input
                            type="number"
                            min="1"
                            max="59"
                            value={schedules.seasonality_analysis.minutes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const value = parseInt(e.target.value) || 1;
                              setSchedules((prev: AlgorithmSchedules) => ({ ...prev, seasonality_analysis: { ...prev.seasonality_analysis, minutes: value < 1 ? 1 : value } }));
                            }}
                            className={styles.scheduleInput}
                          />
                        </div>
                        <div className={styles.tableCell}>
                          <button
                            className={styles.saveButton}
                            onClick={() => handleScheduleUpdate('seasonality_analysis', schedules.seasonality_analysis.hours, schedules.seasonality_analysis.minutes)}
                          >
                            Сохранить
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className={styles.historySection}>
                  <h3 className={styles.historyTitle}>История выполнения алгоритмов</h3>
                  <div className={styles.filtersContainer}>
                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Дата:</label>
                      <input
                        type="date"
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className={styles.dateInput}
                      />
                    </div>
                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Статус:</label>
                      <select
                        value={historyStatusFilter}
                        onChange={(e) => setHistoryStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">Все</option>
                        <option value="IN_PROCESS">В процессе</option>
                        <option value="SUCCESS">Успешно</option>
                        <option value="FAILED">Ошибка</option>
                      </select>
                    </div>
                    <div className={styles.filterGroup}>
                      <label className={styles.filterLabel}>Алгоритм:</label>
                      <select
                        value={historyAlgorithmFilter}
                        onChange={(e) => setHistoryAlgorithmFilter(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="">Все</option>
                        <option value="CLUSTERIZATION">Кластеризация</option>
                        <option value="GENETIC_ALGORITHM">Рейтинг поставщиков</option>
                        <option value="REVERSE_GENETIC_ALGORITHM">Рейтинг автозапчастей</option>
                        <option value="SEASONALITY_ANALYSIS">Анализ сезонности</option>
                        <option value="PRICE_FORECASTING">Прогнозирование цен</option>
                      </select>
                    </div>
                  </div>

                  {historyLoading ? (
                    <div className={styles.emptyState}>
                      Загрузка...
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className={styles.emptyState}>
                      Нет данных за выбранную дату
                    </div>
                  ) : (
                    <div className={styles.historyTable}>
                      <div className={styles.tableHeader}>
                        <div className={styles.tableHeaderCell}>Алгоритм</div>
                        <div className={styles.tableHeaderCell}>Статус</div>
                        <div className={styles.tableHeaderCell}>Начало выполнения</div>
                        <div className={styles.tableHeaderCell}>Обновление статуса</div>
                        <div className={styles.tableHeaderCell}>Длительность</div>
                      </div>
                      {historyData.map((item) => (
                        <div key={item.id} className={styles.tableRow}>
                          <div className={styles.tableCell}>{item.algorithm_name}</div>
                          <div className={styles.tableCell}>
                            <span className={`${styles.statusBadge} ${styles[`status${item.status_code}`]}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className={styles.tableCell}>{item.started_at}</div>
                          <div className={styles.tableCell}>{item.updated_at || '-'}</div>
                          <div className={styles.tableCell}>{item.duration || '-'}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {historyPagination && historyPagination.total_pages > 1 && (
                    <div className={styles.pagination}>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                        disabled={!historyPagination.has_prev_page}
                      >
                        Назад
                      </button>
                      <span className={styles.paginationInfo}>
                        Страница {historyPagination.current_page} из {historyPagination.total_pages}
                      </span>
                      <button
                        className={styles.paginationButton}
                        onClick={() => setHistoryPage(prev => prev + 1)}
                        disabled={!historyPagination.has_next_page}
                      >
                        Вперед
                      </button>
                    </div>
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

