import type { MobileTab } from '@timesheet/types';

interface TabBarProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  onAdd: () => void;
}

export function TabBar({ activeTab, onChangeTab, onAdd }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="Main navigation">
      <button
        className={`tab-bar__btn${activeTab === 'timeline' ? ' tab-bar__btn--active' : ''}`}
        onClick={() => onChangeTab('timeline')}
        aria-current={activeTab === 'timeline' ? 'page' : undefined}
      >
        <span className="tab-bar__icon" aria-hidden="true">📅</span>
        Timeline
      </button>

      <button
        className="tab-bar__fab"
        onClick={onAdd}
        aria-label="Add new entry"
      >
        ＋
      </button>

      <button
        className={`tab-bar__btn${activeTab === 'entries' ? ' tab-bar__btn--active' : ''}`}
        onClick={() => onChangeTab('entries')}
        aria-current={activeTab === 'entries' ? 'page' : undefined}
      >
        <span className="tab-bar__icon" aria-hidden="true">📋</span>
        Entries
      </button>
    </nav>
  );
}
