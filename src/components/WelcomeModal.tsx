import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { ChatIcon, ImageIcon, VideoIcon } from './IconComponents';

interface WelcomeModalProps {
  onClose: (name: string) => void;
  initialName: string | null;
}

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-600/20 text-purple-400">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
    </div>
);


export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, initialName }) => {
  const [name, setName] = useState(initialName || '');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-lg w-full p-8 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center text-center">
            <BrandLogo className="w-12 h-12 text-purple-400 mb-4" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                أهلاً بك في شات حمزاوي
            </h1>
            <p className="text-gray-400 mb-6">
                مساعدك الذكي. استكشف قدرات الذكاء الاصطناعي عبر شخصيات متعددة.
                 <br/>
                <span className="text-sm text-purple-400 font-semibold">هذه الدردشة هدية مجانية لجميع متابعي المبرمج حمزة محمد سعيد.</span>
            </p>

            <div className="space-y-4 text-start w-full mb-8">
                <Feature icon={<ChatIcon className="w-5 h-5"/>} title="محادثات ذكية" description="اطرح أسئلة، حلل الصور، واحصل على إجابات دقيقة." />
                <Feature icon={<ImageIcon className="w-5 h-5"/>} title="توليد الصور" description="حوّل أفكارك إلى صور إبداعية بمجرد وصفها." />
                <Feature icon={<VideoIcon className="w-5 h-5"/>} title="توليد الفيديو" description="أنشئ مقاطع فيديو فريدة من النصوص أو الصور." />
            </div>

            <div className="w-full text-start mb-6">
                <label htmlFor="user-name-welcome" className="block text-sm font-medium text-gray-300 mb-2">ما هو اسمك؟ (اختياري)</label>
                <input
                    type="text"
                    id="user-name-welcome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أدخل اسمك..."
                    className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
                />
            </div>
            
            <button
                onClick={() => onClose(name)}
                className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-all focus:ring-4 focus:ring-purple-500/50 mt-4"
            >
                ابدأ الآن
            </button>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.4s ease-out forwards;
        }
    `}</style>
    </div>
  );
};