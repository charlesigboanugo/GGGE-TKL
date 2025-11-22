import { useUser } from "@/contexts/UserContext";
import { Button } from "../ui/button";

export default function DashboardAccountSetting() {
  const { signOut, deleteUserProfile, supabaseAuthUser } = useUser();

  return (
    <section className="w-full max-w-4xl mx-auto px-6 sm:px-8 py-10 flex flex-col gap-10">
      
      {/* Account Info - stacked vertically */}
      <section className="w-full flex flex-col gap-6">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-gray-300">Email</p>
          <p className="w-full px-4 py-2 rounded-lg bg-[#373751] text-gray-200 break-all">
            {supabaseAuthUser?.email}
          </p>
        </div>

        {/* Last Signed In */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-gray-300">Last Signed In</p>
          <p className="w-full px-4 py-2 rounded-lg bg-[#373751] text-gray-200">
            {supabaseAuthUser?.last_sign_in_at
              ? new Date(supabaseAuthUser.last_sign_in_at).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A"}
          </p>
        </div>

        {/* Member Since */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-gray-300">Member Since</p>
          <p className="w-full px-4 py-2 rounded-lg bg-[#373751] text-gray-200">
            {supabaseAuthUser?.created_at
              ? new Date(supabaseAuthUser.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>
      </section>

      {/* Security & Actions */}
      <section className="w-full bg-[#2d2d42] flex flex-col gap-4 py-5 px-4 sm:px-6 rounded-lg shadow-md">
        <p className="text-gray-300 text-sm sm:text-base">
          To keep your account and data secure, you can log out from all devices associated with your account.
          You may also permanently delete your account. This action cannot be undone!
        </p>

        <div className="w-full flex flex-col sm:flex-row items-center sm:justify-end gap-3 mt-2">
          <Button
            onClick={signOut}
            className="w-full sm:w-auto py-3 px-6 text-sm font-semibold bg-[#3bb4fd] hover:bg-[#3b9cfd] rounded-md shadow-md transition-all duration-300"
          >
            Logout All Devices
          </Button>
          <Button
            onClick={deleteUserProfile}
            className="w-full sm:w-auto py-3 px-6 text-sm font-semibold bg-[#f55656] hover:bg-[#e64444] rounded-md shadow-md transition-all duration-300"
          >
            Delete Account
          </Button>
        </div>
      </section>
    </section>
  );
}