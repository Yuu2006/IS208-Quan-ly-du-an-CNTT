interface HeaderProps {
  activeTab?: string;
}

export function Header({ activeTab = 'dashboard' }: HeaderProps) {
  void activeTab;
  return null;
}
