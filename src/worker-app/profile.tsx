"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./worker-app.module.css";
import { WorkerAppNavigationScreen } from "./screens/navigation-screen";
import { WorkerAppStatusBar } from "./screens/status-bar";
import {
  getLanguageLabel,
  loadStoredWorkerProfile,
  persistWorkerProfile,
  saveWorkerDisplayName,
  saveWorkerLanguage,
  WORKER_APP_VERSION_LABEL,
  WORKER_LANGUAGE_OPTIONS,
  type WorkerLanguage,
  type WorkerProfile,
} from "./profile-data";

export type ProfileFrameView = "data" | "loading";
export type ProfilePreviewState =
  | "profile-data"
  | "profile-loading"
  | "profile-edit-name"
  | "profile-language-sheet"
  | "profile-logout-dialog"
  | "profile-saving";

type WorkerAppProfilePageProps = {
  showDeviceFrame: boolean;
  theme: "dark" | "light";
  frameTheme?: "dark" | "light";
  embedded?: boolean;
  frameView?: ProfileFrameView;
  previewState?: ProfilePreviewState;
  isInteractive?: boolean;
  onLogout?: () => void;
  onBack?: () => void;
};

type ProfileView = "profile" | "settings" | "password" | "about";

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.profileSection} aria-labelledby={`profile-${title}`}>
      <h3 id={`profile-${title}`} className={styles.homeSectionTitle}>
        {title}
      </h3>
      <div className={styles.homeProgressOverviewCard}>{children}</div>
    </section>
  );
}

export function WorkerAppProfilePage({
  showDeviceFrame,
  theme,
  frameTheme,
  embedded = false,
  frameView = "data",
  previewState = "profile-data",
  isInteractive = true,
  onLogout,
  onBack,
}: WorkerAppProfilePageProps) {
  const [profile, setProfile] = useState<WorkerProfile>(() => loadStoredWorkerProfile());
  const [profileView, setProfileView] = useState<ProfileView>("profile");
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isVersionCopied, setIsVersionCopied] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isEditingName, setIsEditingName] = useState(previewState === "profile-edit-name");
  const [draftName, setDraftName] = useState(profile.displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const resolvedFrameTheme = frameTheme ?? theme;
  const frameClass =
    resolvedFrameTheme === "light" ? styles.androidCanvasLightFrame : styles.androidCanvas;

  const isLoading = frameView === "loading" || previewState === "profile-loading";
  const isEditForced = previewState === "profile-edit-name";
  const isSavingForced = previewState === "profile-saving";
  const isSheetForced = previewState === "profile-language-sheet";
  const isDialogForced = previewState === "profile-logout-dialog";

  const isLanguageSheetVisible = isLanguageSheetOpen || isSheetForced;
  const isLogoutDialogVisible = isLogoutDialogOpen || isDialogForced;
  const isEditing = isEditingName || isEditForced;
  const isSaving = isSavingName || isSavingForced;

  useEffect(() => {
    if (!isEditing) return;
    nameInputRef.current?.focus();
    nameInputRef.current?.select();
  }, [isEditing]);

  const selectLanguage = useCallback(
    async (language: WorkerLanguage) => {
      if (language === profile.language) {
        setIsLanguageSheetOpen(false);
        return;
      }

      setProfile((current) => ({ ...current, language }));
      setIsLanguageSheetOpen(false);
      persistWorkerProfile({ ...profile, language });
      await saveWorkerLanguage(language);
      setProfile(loadStoredWorkerProfile());
    },
    [profile]
  );

  const confirmLogout = useCallback(() => {
    setIsLogoutDialogOpen(false);
    onLogout?.();
  }, [onLogout]);

  const beginNameEdit = useCallback(() => {
    if (!isInteractive || isLoading || isSaving) return;
    setDraftName(profile.displayName);
    setIsEditingName(true);
  }, [isInteractive, isLoading, isSaving, profile.displayName]);

  const cancelNameEdit = useCallback(() => {
    setDraftName(profile.displayName);
    setIsEditingName(false);
  }, [profile.displayName]);

  const saveName = useCallback(async () => {
    const trimmed = draftName.trim();
    if (!trimmed || trimmed === profile.displayName) {
      cancelNameEdit();
      return;
    }

    setProfile((current) => ({ ...current, displayName: trimmed }));
    setIsEditingName(false);
    setIsSavingName(true);

    try {
      await saveWorkerDisplayName(trimmed);
      setProfile(loadStoredWorkerProfile());
    } finally {
      setIsSavingName(false);
    }
  }, [cancelNameEdit, draftName, profile.displayName]);

  const copyAppVersion = useCallback(async () => {
    if (!isInteractive || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(WORKER_APP_VERSION_LABEL);
    setIsVersionCopied(true);
    window.setTimeout(() => setIsVersionCopied(false), 1600);
  }, [isInteractive]);

  const goBack = useCallback(() => {
    if (profileView === "password") {
      setProfileView("settings");
      return;
    }
    if (profileView === "about") {
      setProfileView("settings");
      return;
    }
    if (profileView === "settings") {
      setProfileView("profile");
      return;
    }
    onBack?.();
  }, [onBack, profileView]);

  const headerTitleByView: Record<ProfileView, string> = {
    profile: "Profil",
    settings: "Paramètres",
    password: "Changer le mot de passe",
    about: "À propos",
  };

  const headerSubtitleByView: Record<ProfileView, string> = {
    profile: "Informations du compte",
    settings: "Préférences et sécurité",
    password: "Sécurité du compte",
    about: "Informations de l’application",
  };

  const shouldShowBackButton = true;

  const skeletonRow = (widthClass: string) => (
    <div className={styles.profileRowStatic}>
      <span className={styles.profileRowLabelSkeleton} aria-hidden="true" />
      <span className={`${styles.profileRowValueSkeleton} ${widthClass}`} aria-hidden="true" />
    </div>
  );

  const row = (
    label: string,
    options: {
      value?: string;
      icon?: string;
      onClick?: () => void;
      ariaLabel?: string;
      danger?: boolean;
    } = {}
  ) => {
    const content = (
      <>
        <span className={options.danger ? styles.profileRowLabelDanger : styles.profileRowLabel}>
          {label}
        </span>
        <span className={styles.profileRowValueGroup}>
          {options.value ? (
            <span className={styles.posteFixeCardSubtitle}>{options.value}</span>
          ) : null}
          {options.icon ? (
            <span className={styles.posteArrow} aria-hidden="true">
              {options.icon}
            </span>
          ) : null}
        </span>
      </>
    );

    if (!options.onClick) {
      return (
        <div className={styles.profileRowStatic} key={label}>
          {content}
        </div>
      );
    }

    return (
      <button
        className={styles.profileRowTappable}
        key={label}
        type="button"
        aria-label={options.ariaLabel}
        onClick={options.onClick}
      >
        {content}
      </button>
    );
  };

  const stackedRow = (label: string, value: string) => (
    <div className={styles.profileRowStacked} key={label}>
      <span className={styles.profileRowLabel}>{label}</span>
      <span className={styles.profileRowStackedValue}>{value}</span>
    </div>
  );

  const identityCard = (
    <ProfileSection title="Identité">
      <div className={styles.profileIdentityCardBody}>
        <div className={styles.profileIdentityHero}>
          {isLoading ? (
            <span className={styles.profileIdentityAvatarSkeleton} aria-hidden="true" />
          ) : (
            <div className={styles.profileIdentityAvatar} aria-hidden="true">
              {profile.initials}
            </div>
          )}
          {isLoading ? (
            <>
              <span className={styles.profileIdentityNameSkeleton} aria-hidden="true" />
              <span className={styles.profileIdentityRoleSkeleton} aria-hidden="true" />
            </>
          ) : (
            <>
              <div className={styles.profileNameDisplayRow}>
                <p className={styles.profileIdentityName}>{profile.displayName}</p>
                <button
                  className={styles.profileEditNameButton}
                  type="button"
                  aria-label="Modifier le nom"
                  disabled={isLoading || isSaving}
                  onClick={beginNameEdit}
                >
                  <span className={styles.googleSymbol} aria-hidden="true">
                    edit
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className={styles.profileInfoRows} aria-label="Informations du compte">
          {isLoading ? (
            <>
              {skeletonRow(styles.profileRowValueSkeletonLong)}
              {skeletonRow(styles.profileRowValueSkeletonMedium)}
            </>
          ) : (
            <>
              {stackedRow("Nom d’utilisateur", profile.username)}
              {stackedRow("Téléphone", profile.phone)}
            </>
          )}
        </div>
      </div>
    </ProfileSection>
  );

  const organizationCard = (
    <ProfileSection title="Organisation">
      <div className={styles.profileInfoRows} aria-label="Informations de l’organisation">
        {isLoading ? (
          <>
            {skeletonRow(styles.profileRowValueSkeletonShort)}
            {skeletonRow(styles.profileRowValueSkeletonMedium)}
          </>
        ) : (
          <>
            {row("Rôle", { value: profile.role })}
            {row("Responsable", { value: profile.managerName })}
          </>
        )}
      </div>
    </ProfileSection>
  );

  const loadingProfileScreen = (
    <>
      {identityCard}
      {organizationCard}
      <div className={styles.homeProgressOverviewCard}>
        {skeletonRow(styles.profileRowValueSkeletonShort)}
      </div>
      <span className={styles.profileLogoutSkeleton} aria-hidden="true" />
    </>
  );

  const profileScreen = (
    <>
      {identityCard}
      {organizationCard}
      <div className={styles.homeProgressOverviewCard}>
        {row("Paramètres", { icon: "chevron_right", onClick: () => setProfileView("settings") })}
      </div>
      <button
        className={styles.profileLogoutButton}
        type="button"
        onClick={() => isInteractive && setIsLogoutDialogOpen(true)}
      >
        Se déconnecter
      </button>
    </>
  );

  const settingsScreen = (
    <div className={styles.homeProgressOverviewCard}>
      {row("Changer le mot de passe", { icon: "chevron_right", onClick: () => setProfileView("password") })}
      {row("Langue", {
        value: getLanguageLabel(profile.language),
        icon: "chevron_right",
        onClick: () => setIsLanguageSheetOpen(true),
      })}
      {row("À propos", { icon: "chevron_right", onClick: () => setProfileView("about") })}
    </div>
  );

  const passwordScreen = (
    <form className={styles.profilePasswordForm}>
      <label className={styles.profileFieldLabel} htmlFor="profile-current-password">
        Mot de passe actuel
      </label>
      <div className={styles.profilePasswordInputWrap}>
        <input
          id="profile-current-password"
          className={`${styles.profileTextInput} ${styles.profilePasswordInput}`}
          type={isCurrentPasswordVisible ? "text" : "password"}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
        />
        {currentPassword ? (
          <button
            className={styles.profilePasswordToggle}
            type="button"
            aria-label={isCurrentPasswordVisible ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"}
            onClick={() => setIsCurrentPasswordVisible((visible) => !visible)}
          >
            <span className={styles.googleSymbol} aria-hidden="true">
              {isCurrentPasswordVisible ? "visibility" : "visibility_off"}
            </span>
          </button>
        ) : null}
      </div>
      <p className={styles.profilePasswordHelpText}>
        Mot de passe oublié ? Contactez votre responsable.
      </p>
      <label className={styles.profileFieldLabel} htmlFor="profile-new-password">
        Nouveau mot de passe
      </label>
      <div className={styles.profilePasswordInputWrap}>
        <input
          id="profile-new-password"
          className={`${styles.profileTextInput} ${styles.profilePasswordInput}`}
          type={isNewPasswordVisible ? "text" : "password"}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        {newPassword ? (
          <button
            className={styles.profilePasswordToggle}
            type="button"
            aria-label={isNewPasswordVisible ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"}
            onClick={() => setIsNewPasswordVisible((visible) => !visible)}
          >
            <span className={styles.googleSymbol} aria-hidden="true">
              {isNewPasswordVisible ? "visibility" : "visibility_off"}
            </span>
          </button>
        ) : null}
      </div>
      <label className={styles.profileFieldLabel} htmlFor="profile-confirm-password">
        Confirmer le nouveau mot de passe
      </label>
      <div className={styles.profilePasswordInputWrap}>
        <input
          id="profile-confirm-password"
          className={`${styles.profileTextInput} ${styles.profilePasswordInput}`}
          type={isConfirmPasswordVisible ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        {confirmPassword ? (
          <button
            className={styles.profilePasswordToggle}
            type="button"
            aria-label={isConfirmPasswordVisible ? "Masquer la confirmation du mot de passe" : "Afficher la confirmation du mot de passe"}
            onClick={() => setIsConfirmPasswordVisible((visible) => !visible)}
          >
            <span className={styles.googleSymbol} aria-hidden="true">
              {isConfirmPasswordVisible ? "visibility" : "visibility_off"}
            </span>
          </button>
        ) : null}
      </div>
      <button className={styles.profilePrimaryButton} type="button">
        Changer le mot de passe
      </button>
    </form>
  );

  const aboutScreen = (
    <div className={styles.homeProgressOverviewCard}>
      {row("Version de l’application", {
        value: isVersionCopied ? "Copié" : WORKER_APP_VERSION_LABEL,
        icon: "content_copy",
        ariaLabel: "Copier la version de l'application",
        onClick: () => void copyAppVersion(),
      })}
    </div>
  );

  const screenByView: Record<ProfileView, ReactNode> = {
    profile: isLoading ? loadingProfileScreen : profileScreen,
    settings: settingsScreen,
    password: passwordScreen,
    about: aboutScreen,
  };

  const content = (
    <>
      <div
        className={`${styles.secteursContent} ${styles.profileContent} ${styles.secteursContentNoBottomBar}`}
        style={!isInteractive ? { pointerEvents: "none" } : undefined}
      >
        <div className={styles.posteStickyTop}>
          <div
            className={`${styles.homeHeaderRow} ${shouldShowBackButton ? styles.profileHeaderRow : ""}`}
          >
            {shouldShowBackButton ? (
              <button
                className={styles.profileBackButton}
                type="button"
                aria-label="Retour"
                onClick={goBack}
              >
                <span className={styles.googleSymbol} aria-hidden="true">
                  arrow_back
                </span>
              </button>
            ) : null}
            <div className={styles.posteFixeTitleBlock}>
              <h2 className={styles.posteFixeTitle}>{headerTitleByView[profileView]}</h2>
              <p className={styles.posteFixeSubtitle}>{headerSubtitleByView[profileView]}</p>
            </div>
          </div>
        </div>

        {screenByView[profileView]}
      </div>

      {isLanguageSheetVisible ? (
        <div
          className={styles.profileSheetOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Choisir la langue"
          onClick={() => setIsLanguageSheetOpen(false)}
        >
          <div className={styles.profileLanguageSheet} onClick={(event) => event.stopPropagation()}>
            <div className={styles.profileLanguageSheetHandle} aria-hidden="true" />
            <h4 className={styles.profileLanguageSheetTitle}>Langue</h4>
            <div className={styles.profileLanguageOptions} role="listbox" aria-label="Langues disponibles">
              {WORKER_LANGUAGE_OPTIONS.map((option) => {
                const isSelected = profile.language === option.code;
                return (
                  <button
                    key={option.code}
                    className={styles.profileLanguageOption}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => void selectLanguage(option.code)}
                  >
                    <span>{option.label}</span>
                    <span
                      className={`${styles.profileLanguageRadio} ${
                        isSelected ? styles.profileLanguageRadioSelected : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div
          className={styles.profileSheetOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-name-sheet-title"
          onClick={cancelNameEdit}
        >
          <div className={styles.profileNameEditStack} onClick={(event) => event.stopPropagation()}>
            <div className={styles.profileNameSheet}>
              <div className={styles.profileLanguageSheetHandle} aria-hidden="true" />
              <h4 id="profile-name-sheet-title" className={styles.profileLanguageSheetTitle}>
                Modifier votre nom
              </h4>
              <p className={styles.profileNameSheetText}>
                Ce nom sera visible sur votre profil et pour votre responsable.
              </p>
              <div className={styles.profileOutlinedField}>
                <label className={styles.profileOutlinedLabel} htmlFor="profile-display-name">
                  Nom complet
                </label>
                <input
                  id="profile-display-name"
                  ref={nameInputRef}
                  className={styles.profileOutlinedInput}
                  type="text"
                  value={draftName}
                  aria-label="Nom"
                  placeholder="Prénom et nom"
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveName();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelNameEdit();
                    }
                  }}
                  autoComplete="name"
                />
                {draftName ? (
                  <button
                    className={styles.profileClearTextButton}
                    type="button"
                    aria-label="Effacer le nom"
                    onClick={() => setDraftName("")}
                  >
                    <span className={styles.googleSymbol} aria-hidden="true">
                      close
                    </span>
                  </button>
                ) : null}
              </div>
              <div className={styles.profileNameSheetActions}>
                <button
                  className={styles.profileNameSheetSecondary}
                  type="button"
                  disabled={isSaving}
                  onClick={cancelNameEdit}
                >
                  Annuler
                </button>
                <button
                  className={styles.profileNameSheetPrimary}
                  type="button"
                  disabled={!draftName.trim() || isSaving}
                  onClick={() => void saveName()}
                >
                  Mettre à jour
                </button>
              </div>
            </div>
            <div className={styles.profileKeyboardMockup} aria-hidden="true">
              {["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"].map((rowKeys) => (
                <div className={styles.profileKeyboardRow} key={rowKeys}>
                  {rowKeys.split("").map((key) => (
                    <span className={styles.profileKeyboardKey} key={key}>
                      {key}
                    </span>
                  ))}
                </div>
              ))}
              <div className={styles.profileKeyboardRow}>
                <span className={styles.profileKeyboardKeyWide}>123</span>
                <span className={styles.profileKeyboardSpace} />
                <span className={styles.profileKeyboardKeyWide}>retour</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isLogoutDialogVisible ? (
        <div
          className={styles.profileConfirmOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-logout-title"
          onClick={() => setIsLogoutDialogOpen(false)}
        >
          <div className={styles.profileConfirmCard} onClick={(event) => event.stopPropagation()}>
            <h4 id="profile-logout-title" className={styles.profileConfirmTitle}>
              Quitter la session ?
            </h4>
            <p className={styles.profileConfirmText}>
              Vous devrez saisir votre identifiant et votre mot de passe pour revenir sur
              l’application.
            </p>
            <div className={styles.profileConfirmActions}>
              <button className={styles.profileConfirmDanger} type="button" onClick={confirmLogout}>
                Se déconnecter
              </button>
              <button
                className={styles.profileConfirmSecondary}
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className={showDeviceFrame ? frameClass : styles.androidCanvasNoFrame}>
      <div
        className={`${styles.androidScreen} ${
          theme === "dark" ? styles.androidScreenDark : styles.androidScreenLight
        }`}
      >
        <WorkerAppStatusBar theme={theme} />
        {content}
        <WorkerAppNavigationScreen surface="page" />
      </div>
    </div>
  );
}
