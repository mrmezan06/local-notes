/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/database';
import { hashPassword } from '../utils/crypto';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [vaultPassword, setVaultPassword] = useState('');
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

    setLoginPassword(password);
    setUser({ username });
    setHasAccount(true);
  };

  const loginMaster = async (username, password) => {
    const account = await db.auth.where({ username }).first();
    if (!account) return false;

    const checkHash = await hashPassword(password);
    if (account.keycheck === checkHash) {
      setLoginPassword(password);
      setUser({ username });
      return true;
    }
    return false;
  };

  const resetLoginPasswordWithRecovery = async (recoveryCode, newPassword) => {
    // FIXED: Added .toCollection() wrapper for Dexie syntax compliance
    const account = await db.auth.toCollection().first();
    if (!account) return false;

    const checkRecoveryHash = await hashPassword(recoveryCode);
    if (account.recoveryHash !== checkRecoveryHash) return false;

    const newLoginHash = await hashPassword(newPassword);
    await db.auth.update(account.id, { keycheck: newLoginHash });

    setLoginPassword(newPassword);
    setUser({ username: account.username });
    return true;
  };

  const configureVaultKey = async (vaultKey) => {
    // FIXED: Added .toCollection() wrapper for Dexie syntax compliance
    const account = await db.auth.toCollection().first();
    if (!account) return;
    const hashedVaultKey = await hashPassword(vaultKey);
    await db.auth.update(account.id, { vaultKeyCheck: hashedVaultKey });
    setVaultPassword(vaultKey);
    setIsVaultConfigured(true);
  };

  const unlockVault = async (vaultKey) => {
    // FIXED: Added .toCollection() wrapper for Dexie syntax compliance
    const account = await db.auth.toCollection().first();
    const hashCheck = await hashPassword(vaultKey);
    if (account.vaultKeyCheck === hashCheck) {
      setVaultPassword(vaultKey);
      return true;
    }
    return false;
  };

  const resetVaultKeyWithRecovery = async (recoveryCode, newVaultKey) => {
    // FIXED: Added .toCollection() wrapper for Dexie syntax compliance
    const account = await db.auth.toCollection().first();
    if (!account) return false;

    const checkRecoveryHash = await hashPassword(recoveryCode);
    if (account.recoveryHash !== checkRecoveryHash) return false;

    const newVaultHash = await hashPassword(newVaultKey);
    await db.auth.update(account.id, { vaultKeyCheck: newVaultHash });

    setVaultPassword(newVaultKey);
    setIsVaultConfigured(true);
    return true;
  };

  const lockVaultInstantly = () => {
    setVaultPassword('');
  };

  const logout = () => {
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
