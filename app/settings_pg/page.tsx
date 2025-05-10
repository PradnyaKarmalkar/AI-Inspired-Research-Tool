"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, History, CreditCard, Settings, ArrowLeft, User, Bell, Shield, FileText, CreditCard as BillingIcon, Moon, Globe, Key, Upload, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface UserData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profileImage?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: true,
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData({
        firstName: parsedUser.firstName || "",
        lastName: parsedUser.lastName || "",
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        profileImage: parsedUser.profileImage || null,
      });
      
      // If user has a profile image, fetch it from the server
      if (parsedUser.user_id) {
        fetch(`http://localhost:5000/get-profile-image/${parsedUser.user_id}`)
          .then(response => {
            if (response.ok) {
              const imageUrl = `http://localhost:5000/get-profile-image/${parsedUser.user_id}`;
              setProfileImage(imageUrl);
              // Update localStorage with the correct image URL
              const updatedUser = {
                ...parsedUser,
                profileImage: imageUrl,
              };
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          })
          .catch(error => {
            console.error('Error fetching profile image:', error);
          });
      }
    }
    setIsLoading(false);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', JSON.parse(localStorage.getItem('user') || '{}').user_id);

      const response = await fetch('http://localhost:5000/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        // Get the user data from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Update the profile image URL
        const imageUrl = `http://localhost:5000/get-profile-image/${user.user_id}`;
        setProfileImage(imageUrl);

        // Update user data in localStorage
        const updatedUser = {
          ...user,
          profileImage: imageUrl,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error(result.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.user_id) {
        // Call backend to remove the image
        const response = await fetch(`http://localhost:5000/remove-profile-image/${user.user_id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setProfileImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          // Update user data in localStorage
          const updatedUser = {
            ...user,
            profileImage: null,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          throw new Error('Failed to remove image');
        }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image. Please try again.');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Update localStorage with new user data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        ...userData,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      // Validate after state update
      if (name === 'newPassword' || name === 'confirmPassword') {
        if (newData.newPassword !== newData.confirmPassword) {
          setPasswordError("New passwords do not match");
        } else if (newData.newPassword.length < 8) {
          setPasswordError("Password must be at least 8 characters long");
        } else {
          setPasswordError("");
        }
      }
      return newData;
    });
  };

  const handlePasswordUpdate = async () => {
    // Validate passwords before proceeding
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }
    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    setIsPasswordUpdating(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch('http://localhost:5000/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Password updated successfully');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordError('');
      } else {
        alert(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password. Please try again.');
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const settingsSections = [
    {
      id: "profile",
      icon: <User size={20} />,
      title: "Profile",
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Picture'}
              </button>
              {/* {profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove Picture
                </button>
              )} */}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={userData.username}
              onChange={(e) => setUserData({ ...userData, username: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter username"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter email"
            />
          </div>
          <button 
            onClick={handleProfileUpdate}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      ),
    },
    {
      id: "preferences",
      icon: <Moon size={20} />,
      title: "Preferences",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-gray-500">Enable dark mode for better visibility</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-blue-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      ),
    },
    // {
    //   id: "notifications",
    //   icon: <Bell size={20} />,
    //   title: "Notifications",
    //   content: (
    //     <div className="space-y-4">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <h3 className="font-medium">Email Notifications</h3>
    //           <p className="text-sm text-gray-500">Receive email updates</p>
    //         </div>
    //         <button
    //           onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
    //           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    //             notifications.email ? "bg-blue-500" : "bg-gray-200"
    //           }`}
    //         >
    //           <span
    //             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    //               notifications.email ? "translate-x-6" : "translate-x-1"
    //             }`}
    //           />
    //         </button>
    //       </div>
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <h3 className="font-medium">Push Notifications</h3>
    //           <p className="text-sm text-gray-500">Receive push notifications</p>
    //         </div>
    //         <button
    //           onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
    //           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    //             notifications.push ? "bg-blue-500" : "bg-gray-200"
    //           }`}
    //         >
    //           <span
    //             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    //               notifications.push ? "translate-x-6" : "translate-x-1"
    //             }`}
    //           />
    //         </button>
    //       </div>
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <h3 className="font-medium">Updates</h3>
    //           <p className="text-sm text-gray-500">Get notified about updates</p>
    //         </div>
    //         <button
    //           onClick={() => setNotifications({ ...notifications, updates: !notifications.updates })}
    //           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    //             notifications.updates ? "bg-blue-500" : "bg-gray-200"
    //           }`}
    //         >
    //           <span
    //             className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
    //               notifications.updates ? "translate-x-6" : "translate-x-1"
    //             }`}
    //           />
    //         </button>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      id: "security",
      icon: <Shield size={20} />,
      title: "Security",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Confirm new password"
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
          <button 
            onClick={handlePasswordUpdate}
            disabled={isPasswordUpdating || !!passwordError}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPasswordUpdating ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      ),
    },
    {
      id: "billing",
      icon: <BillingIcon size={20} />,
      title: "Billing",
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium text-black">Current Plan</h3>
            <p className="text-sm text-gray-500">Premium Plan - $9.99/month</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Payment Method</label>
            <select className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
              <option>Credit Card</option>
              <option>PayPal</option>
            </select>
          </div>
          <button className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Update Payment Method
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-[#0f0f1b] text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`w-72 p-6 flex flex-col border-r ${isDarkMode ? 'bg-[#1a1a2f] border-[#2e2e40]' : 'bg-white border-gray-200'}`}>
        <h1 className="text-2xl font-bold mb-6"> Research Buddy</h1>
        <nav className="space-y-3">
          <NavItem icon={<Home size={20} />} text="Home" onClick={() => router.push('/home')} />
          <NavItem icon={<History size={20} />} text="History" onClick={() => router.push("/history")} />
          <NavItem icon={<CreditCard size={20} />} text="Billing" onClick={() => router.push("/billing")} />
          <NavItem icon={<Settings size={20} />} text="Settings" active />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={() => router.push('/home')}
            className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Home
          </button>
        </div>

        {/* Settings Content */}
        <div className="grid grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="col-span-1">
            <div className={`rounded-lg p-4 space-y-2 ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white shadow'}`}>
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                    activeTab === section.id
                      ? isDarkMode 
                        ? "bg-[#2e2e40] text-white" 
                        : "bg-purple-100 text-purple-600"
                      : isDarkMode
                        ? "text-gray-400 hover:bg-[#2e2e40]"
                        : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="col-span-3">
            <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-[#1e1e2f]' : 'bg-white shadow'}`}>
              {settingsSections.find((section) => section.id === activeTab)?.content}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Navigation Item
function NavItem({ icon, text, onClick, active }: { icon: React.ReactNode; text: string; onClick?: () => void; active?: boolean }) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
        active 
          ? isDarkMode 
            ? "bg-[#2e2e40]" 
            : "bg-purple-100 text-purple-600"
          : isDarkMode
            ? "hover:bg-[#2e2e40]"
            : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{text}</span>
    </div>
  );
} 