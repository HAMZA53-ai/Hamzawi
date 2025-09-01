import React from 'react';
import { BrandLogo } from './BrandLogo';
import { ChatIcon, ImageIcon, VideoIcon } from './IconComponents';

interface WelcomeModalProps {
  onClose: () => void;
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


export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
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
                <span className="text-sm text-purple-400 font-semibold">هذه الدردشة هدية مجانية لجميع متابعي المبرمج حمزة.</span>
            </p>

            <div className="space-y-4 text-start w-full mb-8">
                <Feature icon={<ChatIcon className="w-5 h-5"/>} title="محادثات ذكية" description="اطرح أسئلة، حلل الصور، واحصل على إجابات دقيقة." />
                <Feature icon={<ImageIcon className="w-5 h-5"/>} title="توليد الصور" description="حوّل أفكارك إلى صور إبداعية بمجرد وصفها." />
                <Feature icon={<VideoIcon className="w-5 h-5"/>} title="توليد الفيديو" description="أنشئ مقاطع فيديو فريدة من النصوص أو الصور." />
            </div>
            
            <div className="w-full mb-6 space-y-4 text-start">
                <h2 className="font-bold text-white text-center mb-4">نود معرفة رأيك بسرعة!</h2>
                <div>
                    <label htmlFor="survey-source" className="block text-sm font-medium text-gray-300 mb-2">من أين سمعت عنا؟</label>
                    <select id="survey-source" name="survey-source" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
                        <option selected>اختر واحداً...</option>
                        <option value="social">مواقع التواصل الاجتماعي</option>
                        <option value="friend">صديق</option>
                        <option value="search">محرك البحث (Google, etc.)</option>
                        <option value="other">آخر</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="survey-usage" className="block text-sm font-medium text-gray-300 mb-2">ما هو استخدامك الأساسي للدردشة؟</label>
                    <select id="survey-usage" name="survey-usage" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
                        <option selected>اختر واحداً...</option>
                        <option value="coding">البرمجة والمساعدة التقنية</option>
                        <option value="writing">الكتابة وإنشاء المحتوى</option>
                        <option value="general">أسئلة عامة ومعلومات</option>
                        <option value="fun">للتسلية والإبداع</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="survey-experience" className="block text-sm font-medium text-gray-300 mb-2">ما هو مستوى خبرتك مع مساعدي الذكاء الاصطناعي؟</label>
                    <select id="survey-experience" name="survey-experience" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
                        <option selected>اختر واحداً...</option>
                        <option value="beginner">مبتدئ</option>
                        <option value="intermediate">متوسط</option>
                        <option value="expert">خبير</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="survey-feature" className="block text-sm font-medium text-gray-300 mb-2">ما هي الميزة الأكثر حماسًا لتجربتها؟</label>
                    <select id="survey-feature" name="survey-feature" className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
                        <option selected>اختر واحداً...</option>
                        <option value="personas">شخصيات الذكاء الاصطناعي المتعددة</option>
                        <option value="image">توليد الصور</option>
                        <option value="video">توليد الفيديو</option>
                        <option value="search">البحث العميق مع Google</option>
                    </select>
                </div>
            </div>
            
            <button
                onClick={onClose}
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