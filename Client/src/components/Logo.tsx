interface LogoProps {
     variant?: 'horizontal' | 'vertical';
}

const Logo = ({ variant = 'horizontal' }: LogoProps) => {
     const isVertical = variant === 'vertical';

     return (
          <div className={`flex ${isVertical ? 'flex-col' : 'items-center'} items-center gap-2.5`}>
               <span className={`${isVertical ? 'w-8 h-8 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10'} rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 transition-all`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={isVertical ? "size-8 sm:size-8" : "size-8 sm:size-8"}>
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" className="text-white" />
                    </svg>
               </span>
               <span className={`${isVertical ? 'text-base sm:text-lg' : 'text-sm sm:text-lg'} font-extrabold text-gray-900 tracking-tight`}>
                    Split-Sync
               </span>
          </div>
     );
};
export default Logo;