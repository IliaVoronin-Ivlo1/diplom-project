'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import adminService, { User } from '@/services/admin.service';
import ProfileHeader from '@/components/ProfileHeader/ProfileHeader';
import AdminBackground from '@/components/AdminBackground/AdminBackground';
import styles from './admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

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
    if (isAdmin) {
      loadUsers(currentPage);
    }
  }, [currentPage, isAdmin]);

  const checkAdminAndLoadUsers = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user.role === 'Admin') {
        setIsAdmin(true);
        await loadUsers(1);
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
        <div className={styles.header}>
          <h1 className={styles.title}>Админ панель</h1>
          <p className={styles.subtitle}>Управление пользователями</p>
        </div>

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
      </div>
    </div>
  );
}

