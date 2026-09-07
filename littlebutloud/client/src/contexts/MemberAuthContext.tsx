import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MemberAuthContextType {
  isMemberLoggedIn: boolean;
  memberId: number | null;
  memberUsername: string | null;
  setMemberLoggedIn: (logged: boolean, memberId?: number, username?: string) => void;
  logout: () => void;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [memberUsername, setMemberUsername] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    const memberLoggedIn = localStorage.getItem('memberLoggedIn') === 'true';
    const storedMemberId = localStorage.getItem('memberId');
    const storedUsername = localStorage.getItem('memberUsername');
    
    if (memberLoggedIn && storedMemberId) {
      setIsMemberLoggedIn(true);
      setMemberId(parseInt(storedMemberId));
      setMemberUsername(storedUsername);
    }
  }, []);

  const setMemberLoggedIn = (logged: boolean, id?: number, username?: string) => {
    setIsMemberLoggedIn(logged);
    if (logged && id && username) {
      setMemberId(id);
      setMemberUsername(username);
      localStorage.setItem('memberLoggedIn', 'true');
      localStorage.setItem('memberId', String(id));
      localStorage.setItem('memberUsername', username);
    }
  };

  const logout = () => {
    setIsMemberLoggedIn(false);
    setMemberId(null);
    setMemberUsername(null);
    localStorage.removeItem('memberLoggedIn');
    localStorage.removeItem('memberId');
    localStorage.removeItem('memberUsername');
  };

  return (
    <MemberAuthContext.Provider value={{ isMemberLoggedIn, memberId, memberUsername, setMemberLoggedIn, logout }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within MemberAuthProvider');
  }
  return context;
}
