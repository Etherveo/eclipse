"use client";

export default function ProfilePicture({ userData }: { userData: any }) {
  return (
    <div>
      {userData.profile_picture_url ? (
        <img 
          src={(() => {
            try {
              const urls = JSON.parse(userData.profile_picture_url);
              return Array.isArray(urls) ? urls[0] : userData.profile_picture_url;
            } catch {
              return userData.profile_picture_url; 
            }
          })()} 
          alt="Profile" 
          onError={(e) => {
            try {
              const urls = JSON.parse(userData.profile_picture_url);
              const currentSrc = (e.target as HTMLImageElement).src;
              const currentIndex = urls.indexOf(currentSrc);
              if (currentIndex > -1 && currentIndex < urls.length - 1) {
                (e.target as HTMLImageElement).src = urls[currentIndex + 1];
              } else {
                (e.target as HTMLImageElement).style.display = 'none';
              }
            } catch (err) {}
          }}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 bg-white"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">👤</div>
      )}
    </div>
  );
}