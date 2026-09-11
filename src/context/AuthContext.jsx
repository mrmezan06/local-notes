/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/database';
import { hashPassword } from '../utils/crypto';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 1. Dynamic State Initialization reading straight from SessionStorage buffers
  const [user, setUser] = useState(() => {
    const cachedUser = sessionStorage.getItem('active_session_user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });

  const [loginPassword, setLoginPassword] = useState(() => {
    return sessionStorage.getItem('active_session_key') || '';
  });

  const [vaultPassword, setVaultPassword] = useState(() => {
    return sessionStorage.getItem('active_vault_key') || '';
  });

  const [hasAccount, setHasAccount] = useState(false);
  const [isVaultConfigured, setIsVaultConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccountState = async () => {
    const records = await db.auth.toArray();
    if (records.length > 0) {
      setHasAccount(true);
      setIsVaultConfigured(!!records[0].vaultKeyCheck);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAccountState();
  }, []);

  const registerMaster = async (username, password, recoveryCode) => {
    const hashedLogin = await hashPassword(password);
    const hashedRecovery = await hashPassword(recoveryCode);

    await db.auth.add({
      username,
      keycheck: hashedLogin,
      recoveryHash: hashedRecovery,
      vaultKeyCheck: '',
    });

    // Cache to local memory session pools instantly
    sessionStorage.setItem('active_session_user', JSON.stringify({ username }));
    sessionStorage.setItem('active_session_key', password);

    setLoginPassword(password);
    setUser({ username });
    setHasAccount(true);
  };

  const loginMaster = async (username, password) => {
    const account = await db.auth.where({ username }).first();
    if (!account) return false;

    const checkHash = await hashPassword(password);
    if (account.keycheck === checkHash) {
      // Cache to local memory session pools instantly
      sessionStorage.setItem(
        'active_session_user',
        JSON.stringify({ username }),
      );
      sessionStorage.setItem('active_session_key', password);

      setLoginPassword(password);
      setUser({ username });
      return true;
    }
    return false;
  };

  const resetLoginPasswordWithRecovery = async (recoveryCode, newPassword) => {
    const account = await db.auth.toCollection().first();
    if (!account) return false;

    const checkRecoveryHash = await hashPassword(recoveryCode);
    if (account.recoveryHash !== checkRecoveryHash) return false;

    const newLoginHash = await hashPassword(newPassword);
    await db.auth.update(account.id, { keycheck: newLoginHash });

    sessionStorage.setItem(
      'active_session_user',
      JSON.stringify({ username: account.username }),
    );
    sessionStorage.setItem('active_session_key', newPassword);

    setLoginPassword(newPassword);
    setUser({ username: account.username });
    return true;
  };

  const configureVaultKey = async (vaultKey) => {
    const account = await db.auth.toCollection().first();
    if (!account) return;
    const hashedVaultKey = await hashPassword(vaultKey);
    await db.auth.update(account.id, { vaultKeyCheck: hashedVaultKey });

    sessionStorage.setItem('active_vault_key', vaultKey);
    setVaultPassword(vaultKey);
    setIsVaultConfigured(true);
  };

  const unlockVault = async (vaultKey) => {
    const account = await db.auth.toCollection().first();
    const hashCheck = await hashPassword(vaultKey);
    if (account.vaultKeyCheck === hashCheck) {
      sessionStorage.setItem('active_vault_key', vaultKey);
      setVaultPassword(vaultKey);
      return true;
    }
    return false;
  };

  const resetVaultKeyWithRecovery = async (recoveryCode, newVaultKey) => {
    const account = await db.auth.toCollection().first();
    if (!account) return false;

    const checkRecoveryHash = await hashPassword(recoveryCode);
    if (account.recoveryHash !== checkRecoveryHash) return false;

    const newVaultHash = await hashPassword(newVaultKey);
    await db.auth.update(account.id, { vaultKeyCheck: newVaultHash });

    sessionStorage.setItem('active_vault_key', newVaultKey);
    setVaultPassword(newVaultKey);
    setIsVaultConfigured(true);
    return true;
  };

  const lockVaultInstantly = () => {
    sessionStorage.removeItem('active_vault_key');
    setVaultPassword('');
  };

  const logout = () => {
    // Shred all session footprints cleanly on manual termination
    sessionStorage.clear();
    setUser(null);
    setLoginPassword('');
    setVaultPassword('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginPassword,
        vaultPassword,
        hasAccount,
        isVaultConfigured,
        loading,
        registerMaster,
        loginMaster,
        resetLoginPasswordWithRecovery,
        configureVaultKey,
        unlockVault,
        resetVaultKeyWithRecovery,
        lockVaultInstantly,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
