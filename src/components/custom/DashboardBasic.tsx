import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ButtonGhost } from "../utility";
import { useUser } from "@/contexts/UserContext";

export default function DashboardBasic() {
  const { updateUserProfile, currentUser, uploadUserAvatar } = useUser();

  const inputFileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [usernameInput, setUsernameInput] = useState(
    currentUser?.username || ""
  );
  const [bioInput, setBioInput] = useState(currentUser?.bio || "");
  const [countryInput, setCountryInput] = useState(currentUser?.country || "");
  // ... other state for avatar (supabase Bucket will be use), etc.

  const handleUpdateUsername = async () => {
    if (usernameInput.trim() === currentUser?.username?.trim()) return;
    // alert("Username is already the same!");

    const success = await updateUserProfile({ username: usernameInput });
    setMessage(success ? "Username updated successfully!" : "Failed to update username.");
  };

  const handleUpdateBio = async () => {
    if (bioInput.trim() === currentUser?.bio?.trim()) return;
    // alert("Bio is already the same!");

    const success = await updateUserProfile({ bio: bioInput });
    setMessage(success ? "Bio updated successfully!" : "Failed to update bio.");
  };

  const handleUpdateCountry = async () => {
    if (countryInput.trim() === currentUser?.country?.trim()) return;

    const success = await updateUserProfile({ country: countryInput });
    setMessage(success ? "Country updated successfully!" : "Failed to update country.");
  };

  const handleChangeAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const avatarUrl = await uploadUserAvatar(file);
      setMessage(avatarUrl ? "Avatar updated successfully!" : "Failed to update avatar.");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage("Error uploading avatar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    setBioInput(currentUser?.bio || "");
    setCountryInput(currentUser?.country || "");
    setUsernameInput(currentUser?.username || "");
  }, [currentUser]);

  return (
    <form className="w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 flex flex-col gap-8">
      {message && (
        <p className="text-center text-green-500 font-medium bg-green-100 p-2 rounded">
          {message}
        </p>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shadow-lg">
          <AvatarImage
            src={currentUser?.avatar || ""}
            alt={`Avatar of ${currentUser?.username}`}
            className="rounded-full object-cover border border-gray-700"
          />
          <AvatarFallback className="text-4xl sm:text-5xl md:text-6xl font-bold capitalize text-gray-800">
            {currentUser?.username?.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center sm:items-start gap-3 sm:gap-2 w-full">
          <input
            type="file"
            name="avatar"
            id="avatar"
            ref={inputFileRef}
            onChange={handleChangeAvatar}
            className="hidden"
          />
          <ButtonGhost
            isLink={false}
            text={uploading ? "Uploading..." : "Upload Avatar"}
            extraClasses="rounded-lg py-3 px-6 sm:py-4 sm:px-8 w-full sm:w-auto"
            onClickEvent={() => inputFileRef.current?.click()}
          />
          <label htmlFor="avatar" className="text-sm text-gray-400 mt-1">
            Recommended: Square 400x400px
          </label>
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-2 w-full">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <label htmlFor="username" className="font-semibold text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="username"
            id="username"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="bg-[#2e2e3f] p-3 rounded-lg w-full outline-none focus:border-2 focus:border-blue-500 transition-colors"
          />
        </div>
        <ButtonGhost
          isLink={false}
          text={"Change"}
          extraClasses="rounded-lg py-3 sm:py-4 px-6 w-full sm:w-auto"
          onClickEvent={handleUpdateUsername}
        />
      </div>

      {/* Country */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-2 w-full">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <label htmlFor="country" className="font-semibold text-gray-300">
            Country / Nationality
          </label>
          <input
            type="text"
            name="country"
            id="country"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            className="bg-[#2e2e3f] p-3 rounded-lg w-full outline-none focus:border-2 focus:border-blue-500 transition-colors"
          />
        </div>
        <ButtonGhost
          isLink={false}
          text={"Change"}
          extraClasses="rounded-lg py-3 sm:py-4 px-6 w-full sm:w-auto"
          onClickEvent={handleUpdateCountry}
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-2 w-full">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <label htmlFor="bio" className="font-semibold text-gray-300">
            Biography / About Me
          </label>
          <textarea
            name="bio"
            id="bio"
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            rows={4}
            className="bg-[#2e2e3f] p-3 rounded-lg w-full outline-none focus:border-2 focus:border-blue-500 transition-colors resize-none"
          />
        </div>
        <ButtonGhost
          isLink={false}
          text={"Change"}
          extraClasses="rounded-lg py-3 sm:py-4 px-6 w-full sm:w-auto"
          onClickEvent={handleUpdateBio}
        />
      </div>
    </form>
  );
}