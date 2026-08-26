export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * Détecte les navigateurs intégrés aux apps (Instagram, Facebook, TikTok...)
 * qui ne peuvent pas lancer AR Quick Look (iOS) ni Scene Viewer (Android).
 */
export const isInAppBrowser = (): boolean => {
  const ua = navigator.userAgent || "";
  return /Instagram|FBAN|FBAV|FB_IAB|Messenger|TikTok|Musical_ly|Snapchat|Pinterest|LinkedInApp|Line\/|Twitter/i.test(
    ua
  );
};

/** Nom lisible de l'app hôte, pour les messages utilisateur. */
export const inAppBrowserName = (): string => {
  const ua = navigator.userAgent || "";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/Messenger/i.test(ua)) return "Messenger";
  if (/TikTok|Musical_ly/i.test(ua)) return "TikTok";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/Pinterest/i.test(ua)) return "Pinterest";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  return "cette application";
};

/**
 * Tente d'ouvrir l'URL courante dans le navigateur système.
 * Android : intent Chrome (fiable). iOS : schéma x-safari (fonctionne sur
 * certaines webviews, sinon l'utilisateur doit passer par le menu "…").
 */
export const openInSystemBrowser = (url: string = window.location.href): void => {
  if (isAndroid()) {
    const clean = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${clean}#Intent;scheme=https;package=com.android.chrome;end`;
    return;
  }
  window.location.href = `x-safari-${url}`;
};
