import React, { useState, useRef, useEffect } from 'react';
import { UserCircleIcon, XIcon } from './IconComponents';

interface UserSettingsPopoverProps {
  userName: string | null;
  setUserName: (name: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
}

const ToggleSwitch: React.FC<{
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}> = ({ id, checked, onChange, label, disabled }) => (
    <label htmlFor={id} className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
        <div className="relative">
            <input
                id={id}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--accent-color)]' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ms-3 text-sm font-medium text-gray-300">{label}</div>
    </label>
);

export const UserSettingsPopover: React.FC<UserSettingsPopoverProps> = ({ userName, setUserName, notificationsEnabled, setNotificationsEnabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(userName || '');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(userName || '');
    }, [userName]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const handleSave = () => {
        setUserName(name);
        setIsOpen(false);
    };

    const handleNotificationToggle = async (checked: boolean) => {
        setIsSaving(true);
        await setNotificationsEnabled(checked);
        setIsSaving(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onClick={() => setIsOpen(p => !p)}
                className="p-2 text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-lg transition-colors"
                aria-label="إعدادات المستخدم"
            >
                <UserCircleIcon className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full mb-2 end-0 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white">الإعدادات</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="user-name-settings" className="block text-sm font-medium text-gray-300 mb-1">الاسم</label>
                            <input
                                id="user-name-settings"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                                placeholder="أدخل اسمك..."
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2"
                            />
                        </div>
                        <div>
                           <ToggleSwitch
                                id="notifications-toggle"
                                checked={notificationsEnabled}
                                onChange={handleNotificationToggle}
                                label="تفعيل الإشعارات"
                                disabled={isSaving}
                           />
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        className="w-full mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-sm"
                    >
                        حفظ
                    </button>
                </div>
            )}
        </div>
    );
};