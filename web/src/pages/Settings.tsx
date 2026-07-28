import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { settingsService, profileService, mediaService, getFullUrl } from '../services/api';
import { Save, Key, User as UserIcon, Globe, Upload, Loader, Image as ImageIcon, Plus, Trash, X, Palette, RefreshCw } from 'lucide-react';

export async function loader() {
  return null;
}

type TabType = 'site' | 'profile' | 'password';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const { colors, updateThemeColors, resetThemeColors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('site');
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);

  // Site Config state
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [commentsAutoApprove, setCommentsAutoApprove] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Extended Site settings
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [footerCopyright, setFooterCopyright] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Global Colors Settings
  const [themePrimaryColor, setThemePrimaryColor] = useState('#3b82f6');
  const [themeButtonBg, setThemeButtonBg] = useState('#3b82f6');
  const [themeTextColor, setThemeTextColor] = useState('#0f172a');

  // Hero Section Settings
  const [heroKicker, setHeroKicker] = useState('');
  const [heroTitleLine1, setHeroTitleLine1] = useState('');
  const [heroTitleLine2, setHeroTitleLine2] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  // Profile Info state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileNickname, setProfileNickname] = useState(user?.nickname || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(user?.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load site settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setFetchingSettings(true);
      try {
        const res = await settingsService.get();
        const data = res.data;
        if (data) {
          setSiteName(data.site_name || '');
          setSiteDescription(data.site_description || '');
          setLogoUrl(data.logo_url || '');
          setCommentsEnabled(data.comments_enabled === 'true');
          setCommentsAutoApprove(data.comments_auto_approve === 'true');
          setFooterCopyright(data.footer_copyright || '');
          setFacebookUrl(data.footer_facebook_url || '');
          setGithubUrl(data.footer_github_url || '');
          setLinkedinUrl(data.footer_linkedin_url || '');
          setTwitterUrl(data.footer_twitter_url || '');
          setThemePrimaryColor(data.theme_primary_color || '#3b82f6');
          setThemeButtonBg(data.theme_button_bg || '#3b82f6');
          setThemeTextColor(data.theme_text_color || '#0f172a');
          setHeroKicker(data.hero_kicker || '');
          setHeroTitleLine1(data.hero_title_line1 || '');
          setHeroTitleLine2(data.hero_title_line2 || '');
          setHeroSubtitle(data.hero_subtitle || '');

          if (data.slider_images) {
            try {
              const parsed = JSON.parse(data.slider_images);
              if (Array.isArray(parsed)) {
                setSliderImages(parsed);
              }
            } catch {
              const split = data.slider_images.split(',').map((s: string) => s.trim()).filter(Boolean);
              setSliderImages(split);
            }
          }
        }
      } catch (err: any) {
        showError(err.response?.data?.message || 'Failed to load site configurations');
      } finally {
        setFetchingSettings(false);
      }
    };

    loadSettings();
  }, [showError]);

  // Sync profile fields if user object loads asynchronously
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileNickname(user.nickname || '');
      setProfileBio(user.bio || '');
      setProfileEmail(user.email || '');
      setProfileAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const res = await mediaService.upload(file);
      if (res.success && res.data) {
        setLogoUrl(res.data.url);
        showSuccess('Logo uploaded successfully');
      } else {
        showError('Upload failed');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to upload logo image');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const res = await mediaService.upload(file);
      if (res.success && res.data) {
        setProfileAvatarUrl(res.data.url);
        showSuccess('Avatar uploaded successfully');
      } else {
        showError('Upload failed');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to upload avatar image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Extended Settings Helpers
  const openMediaModal = async () => {
    try {
      const res = await mediaService.list({ limit: 100 });
      if (res.success && res.data) {
        setMediaList(res.data.items || []);
      }
      setShowMediaModal(true);
    } catch (err) {
      console.error(err);
      showError('Failed to fetch media list');
    }
  };

  const handleAddSliderImage = (url: string) => {
    if (!sliderImages.includes(url)) {
      setSliderImages([...sliderImages, url]);
      showSuccess('Image added to slider list');
    } else {
      showError('This image is already in the slider list');
    }
    setShowMediaModal(false);
  };

  const handleRemoveSliderImage = (url: string) => {
    setSliderImages(sliderImages.filter((img) => img !== url));
    showSuccess('Image removed from slider list');
  };

  // Save Site Configuration
  const handleSaveSiteConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settingsService.update({
        site_name: siteName,
        site_description: siteDescription,
        logo_url: logoUrl,
        comments_enabled: String(commentsEnabled),
        comments_auto_approve: String(commentsAutoApprove),
        slider_images: JSON.stringify(sliderImages),
        footer_copyright: footerCopyright,
        footer_facebook_url: facebookUrl,
        footer_github_url: githubUrl,
        footer_linkedin_url: linkedinUrl,
        footer_twitter_url: twitterUrl,
        theme_primary_color: themePrimaryColor,
        theme_button_bg: themeButtonBg,
        theme_text_color: themeTextColor,
        hero_kicker: heroKicker,
        hero_title_line1: heroTitleLine1,
        hero_title_line2: heroTitleLine2,
        hero_subtitle: heroSubtitle,
      });

      document.documentElement.style.setProperty('--primary-color', themePrimaryColor);
      document.documentElement.style.setProperty('--btn-bg', themeButtonBg);
      document.documentElement.style.setProperty('--text-color', themeTextColor);

      showSuccess('Site configurations updated successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update site configurations');
    } finally {
      setLoading(false);
    }
  };

  // Save Profile Info
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showError('Name is required');
      return;
    }
    if (!profileEmail.trim()) {
      showError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const res = await profileService.updateProfile({
        name: profileName,
        nickname: profileNickname,
        email: profileEmail,
        avatar_url: profileAvatarUrl,
        bio: profileBio,
      });
      if (res.success && res.data) {
        updateUser(res.data);
        showSuccess('Profile updated successfully');
      } else {
        showError('Failed to update profile');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      showSuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">System Settings</h2>
          <p className="text-sm text-gray-400">Manage site configuration, profile information, and security credentials.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex space-x-8">
        <button
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'site'
              ? 'border-accentBlue text-accentBlue'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Site Config
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'profile'
              ? 'border-accentBlue text-accentBlue'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-all duration-200 ${
            activeTab === 'password'
              ? 'border-accentBlue text-accentBlue'
              : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Change Password
        </button>
      </div>

      {/* Tab Contents */}
      <div className="glass-panel border border-slate-200 dark:border-slate-800/50 rounded-2xl p-6 md:p-8 bg-slate-900/30">
        {fetchingSettings ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
            <Loader className="w-8 h-8 animate-spin text-accentBlue" />
            <p className="text-sm">Fetching system settings...</p>
          </div>
        ) : (
          <>
            {/* SITE CONFIG TAB */}
            {activeTab === 'site' && (
              <form onSubmit={handleSaveSiteConfig} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Site Title</label>
                  <input
                    type="text"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="e.g. My Tech Blog"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Site Description / Tagline</label>
                  <textarea
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Describe your site for visitors and SEO bots..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
                  />
                </div>

                {/* Hero Section Config */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                  <h4 className="text-sm font-semibold text-slate-850 dark:text-gray-250">Home Hero Title Banner</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Hero Kicker (Top Small Text)</label>
                    <input
                      type="text"
                      value={heroKicker}
                      onChange={(e) => setHeroKicker(e.target.value)}
                      placeholder="e.g. DevOps VietNam Platform"
                      className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Title Line 1</label>
                      <input
                        type="text"
                        value={heroTitleLine1}
                        onChange={(e) => setHeroTitleLine1(e.target.value)}
                        placeholder="e.g. Nền tảng kết nối cộng đồng"
                        className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Title Line 2 (Highlighted Gradient)</label>
                      <input
                        type="text"
                        value={heroTitleLine2}
                        onChange={(e) => setHeroTitleLine2(e.target.value)}
                        placeholder="e.g. DevOps, Cloud & SRE tại Việt Nam"
                        className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Hero Subtitle</label>
                    <input
                      type="text"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder="e.g. Tìm roadmap, bài viết kỹ thuật, sự kiện..."
                      className="w-full px-4 py-2.5 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300 block">Site Logo</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Logo Preview */}
                    <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center relative shrink-0">
                      {logoUrl ? (
                        <img
                          src={getFullUrl(logoUrl)}
                          alt="Site logo preview"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      )}
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <Loader className="w-5 h-5 animate-spin text-accentBlue" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 w-full">
                      {/* Logo URL Input */}
                      <input
                        type="text"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Or input logo image URL directly..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-650 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                      />
                      {/* Upload Button */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 text-slate-750 dark:text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Logo File
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comment Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-850">
                  <h4 className="text-sm font-semibold text-slate-850 dark:text-gray-200">Comment Moderation Settings</h4>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Enable Comments</label>
                      <p className="text-xs text-gray-500">Allow readers to write comments on blog posts.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={commentsEnabled}
                      onChange={(e) => setCommentsEnabled(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950/60 border border-slate-800 text-accentBlue focus:ring-accentBlue focus:ring-offset-slate-900 focus:ring-offset-2"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Auto-Approve Comments</label>
                      <p className="text-xs text-gray-500">If checked, comments will be published immediately without moderation.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={commentsAutoApprove}
                      onChange={(e) => setCommentsAutoApprove(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950/60 border-slate-800 text-accentBlue focus:ring-accentBlue focus:ring-offset-slate-900 focus:ring-offset-2"
                    />
                  </div>
                </div>

                {/* Slider Images Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-850 dark:text-gray-200">Home Slider Banner Images</h4>
                      <p className="text-xs text-gray-500">Add or remove images shown on the public landing page slider.</p>
                    </div>
                    <button
                      type="button"
                      onClick={openMediaModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accentBlue/10 hover:bg-accentBlue/20 text-accentBlue rounded-xl text-xs font-semibold transition-all border border-accentBlue/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Slider Image
                    </button>
                  </div>

                  {sliderImages.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-gray-500">
                      No slider images selected. The home page will show the default banner.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {sliderImages.map((img) => (
                        <div key={img} className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
                          <img
                            src={getFullUrl(img)}
                            alt=""
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSliderImage(img)}
                            className="absolute top-2 right-2 p-1.5 bg-dangerRed/80 hover:bg-dangerRed text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Remove image"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer and Social Links Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                  <h4 className="text-sm font-semibold text-slate-850 dark:text-gray-200">Footer & Social Network Settings</h4>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Copyright Footer Text</label>
                    <input
                      type="text"
                      value={footerCopyright}
                      onChange={(e) => setFooterCopyright(e.target.value)}
                      placeholder="e.g. © 2026 DevOps.vn. All rights reserved."
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Facebook URL</label>
                      <input
                        type="text"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/your-page"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Github URL</label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/your-username"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">LinkedIn URL</label>
                      <input
                        type="text"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/your-profile"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Twitter URL</label>
                      <input
                        type="text"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        placeholder="https://twitter.com/your-profile"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Global Color Theme Configuration */}
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-850 dark:text-gray-200 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-accentBlue" />
                        Theme Background Colors (Light & Dark)
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Customize background colors for Light and Dark modes (e.g. Dark Navy #090D16 like thanhnamnguyen.dev)</p>
                    </div>
                    <button
                      type="button"
                      onClick={resetThemeColors}
                      className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 hover:text-accentBlue dark:hover:text-accentBlue transition-colors px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reset Colors
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/60">
                    {/* Light Mode Background */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Light Mode Background</span>
                        <span className="text-[10px] text-gray-400 normal-case">Default: #F8FAFC</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.lightBg}
                          onChange={(e) => updateThemeColors({ lightBg: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={colors.lightBg}
                          onChange={(e) => updateThemeColors({ lightBg: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        {[
                          { name: 'Slate Light', color: '#F8FAFC' },
                          { name: 'Pure White', color: '#FFFFFF' },
                          { name: 'Warm Cream', color: '#FDFBF7' },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => updateThemeColors({ lightBg: preset.color })}
                            className="px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-400 hover:border-accentBlue"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dark Mode Background */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Dark Mode Background</span>
                        <span className="text-[10px] text-gray-400 normal-case">Target Blog: #090D16</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors.darkBg}
                          onChange={(e) => updateThemeColors({ darkBg: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent shrink-0"
                        />
                        <input
                          type="text"
                          value={colors.darkBg}
                          onChange={(e) => updateThemeColors({ darkBg: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        {[
                          { name: 'Deep Navy', color: '#090D16' },
                          { name: 'Pure Black', color: '#000000' },
                          { name: 'Midnight', color: '#0F172A' },
                        ].map((preset) => (
                          <button
                            key={preset.color}
                            type="button"
                            onClick={() => updateThemeColors({ darkBg: preset.color })}
                            className="px-2 py-0.5 rounded text-[10px] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-gray-400 hover:border-accentBlue"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themePrimaryColor}
                          onChange={(e) => setThemePrimaryColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themePrimaryColor}
                          onChange={(e) => setThemePrimaryColor(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Button Background</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeButtonBg}
                          onChange={(e) => setThemeButtonBg(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themeButtonBg}
                          onChange={(e) => setThemeButtonBg(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Primary Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={themeTextColor}
                          onChange={(e) => setThemeTextColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={themeTextColor}
                          onChange={(e) => setThemeTextColor(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 text-xs focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Configurations
                  </button>
                </div>
              </form>
            )}

            {/* PROFILE INFO TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl">
                 <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Nickname (Required)</label>
                  <input
                    type="text"
                    value={profileNickname}
                    onChange={(e) => setProfileNickname(e.target.value)}
                    placeholder="Your public nickname..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Bio</label>
                  <textarea
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Write a brief author biography..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300 block">Profile Avatar</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Avatar Preview */}
                    <div className="w-24 h-24 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center relative shrink-0">
                      {profileAvatarUrl ? (
                        <img
                          src={getFullUrl(profileAvatarUrl)}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-accentBlue text-2xl">
                          {profileName ? profileName.charAt(0).toUpperCase() : 'A'}
                        </span>
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <Loader className="w-5 h-5 animate-spin text-accentBlue" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 w-full">
                      {/* Avatar URL Input */}
                      <input
                        type="text"
                        value={profileAvatarUrl}
                        onChange={(e) => setProfileAvatarUrl(e.target.value)}
                        placeholder="Or input profile avatar image URL directly..."
                        className="w-full px-4 py-2 bg-slate-55 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                      />
                      {/* Upload Button */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 text-slate-750 dark:text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Avatar Image
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Profile
                  </button>
                </div>
              </form>
            )}

            {/* CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <form onSubmit={handleSavePassword} className="space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Existing Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter old password..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Must be at least 6 characters..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-750 dark:text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-gray-100 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-accentBlue/60 focus:ring-1 focus:ring-accentBlue/30 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accentBlue to-accentPurple hover:from-accentBlue/90 hover:to-accentPurple/90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-accentBlue/10 transition-all duration-200 disabled:opacity-55"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {showMediaModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800/50 flex justify-between items-center bg-slate-100/30 dark:bg-slate-900/20">
              <div>
                <h3 className="font-bold text-lg text-slate-850 dark:text-gray-100">Select Slider Image</h3>
                <p className="text-xs text-gray-500 font-sans">Pick an image from the library to append to the home slider.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/35 dark:hover:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {mediaList.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-750 mx-auto mb-4" />
                  <p className="text-sm text-gray-500 font-sans">No processed media files available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaList.filter(m => m.type === 'image').map((media) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => handleAddSliderImage(media.url)}
                      className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-accentBlue overflow-hidden relative hover:scale-105 transition-all flex items-center justify-center group"
                    >
                      <img
                        src={getFullUrl(media.thumbnail_url || media.url)}
                        alt=""
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-white">
                        Add to Slider
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
