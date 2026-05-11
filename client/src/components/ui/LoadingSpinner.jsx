export default function LoadingSpinner({ fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
      </div>
    );
  }
  return <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />;
}
