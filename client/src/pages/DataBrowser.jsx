import { useState, useEffect } from 'react';
import { apiRequest } from '../almostnode/container';
import styles from './DataBrowser.module.css';

const ROLE_COLOR = {
  admin: { bg: '#1e1b4b', color: '#a5b4fc' },
  moderator: { bg: '#1c1917', color: '#fcd34d' },
  user: { bg: '#0c1a2e', color: '#7dd3fc' },
};

function useAlmostNodeData(path) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiRequest(path)
      .then(res => {
        if (!res.body.success) throw new Error(res.body.message);
        setData(res.body);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [path]);

  return { data, loading, error };
}

function Spinner() {
  return (
    <div className={styles.spinner}>
      <div className={styles.spinnerRing} />
      <span>AlmostNode fetching…</span>
    </div>
  );
}

function ErrorBox({ message }) {
  return <div className={styles.errorBox}>⚠ {message}</div>;
}

function ProductGrid({ products }) {
  return (
    <div className={styles.grid}>
      {products.map(p => (
        <div key={p.id} className={styles.card}>
          <div className={styles.cardHead}>
            <span className={styles.category}>{p.category}</span>
            <span className={`${styles.stockBadge} ${p.stock > 0 ? styles.inStock : styles.outStock}`}>
              {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <h3 className={styles.cardName}>{p.name}</h3>
          <p className={styles.cardDesc}>{p.description}</p>
          <p className={styles.price}>${p.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

function UserTable({ users }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th><th>Username</th><th>Full Name</th>
            <th>Email</th><th>Role</th><th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => {
            const rc = ROLE_COLOR[u.role] ?? { bg: '#1e293b', color: '#94a3b8' };
            return (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><code>{u.username}</code></td>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>
                  <span className={styles.roleBadge} style={{ background: rc.bg, color: rc.color }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.joinedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Section({ title, path, render }) {
  const { data, loading, error } = useAlmostNodeData(path);
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {data && <span className={styles.sectionCount}>{data.count} items · via AlmostNode</span>}
      </div>
      {loading && <Spinner />}
      {error   && <ErrorBox message={error} />}
      {data    && render(data.data)}
    </div>
  );
}

export default function DataBrowser() {
  return (
    <div>
      <Section
        title="📦 Products"
        path="/api/products"
        render={products => <ProductGrid products={products} />}
      />
      <Section
        title="👤 Users"
        path="/api/users"
        render={users => <UserTable users={users} />}
      />
    </div>
  );
}
