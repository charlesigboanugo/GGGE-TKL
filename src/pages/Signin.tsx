import { ButtonGhost } from "@/components/utility";
import { supabase } from "@/supabase_client";
import { useState, type FormEvent } from "react";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

//
const initialState = {
  email: "",
};

export default function Signin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formdata, setFormdata] = useState(initialState);

  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: formdata.email,
      options: {
        emailRedirectTo: import.meta.env.VITE_PUBLIC_REDIRECT_URL,
      },
    });

    setLoading(false);

    if (error) {
      setMessage("* Something went wrong, please try again later.");
      //console.error(error);
    } else
      setMessage(
        "* A link has been sent to your email, proceed to verify. Check Spam"
      );

    setFormdata(initialState);
  }

  return (
    <section className="min-h-screen w-full flex items-center justify-center">
      <section className="bg-[#1b1b27] w-[95%] md:w-fit px-4 py-12 flex flex-col items-center justify-center gap-5">
        {message && <p className="text-blue-300">{message}</p>}
        <h2 className="text-7xl font-extrabold">Hello.</h2>
        <p>Sign in or join us using your email!</p>
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center gap-2"
        >
          <input
            type="email"
            placeholder="example@example.com"
            value={formdata.email}
            onChange={(e) =>
              setFormdata({ ...formdata, email: e.target.value })
            }
            className="flex-1 px-4 py-2 rounded-lg bg-[#373751]"
          />
          <ButtonGhost
            isLink={false}
            text={loading ? <FaSpinner /> : "Go"}
            extraClasses="rounded-lg"
            type="submit"
          />
        </form>
        <p className="text-sm text-center">
          Enter your email address and we'll send you a sign in link
        </p>
        <p className="text-sm w-fit md:w-[70%] lg:w-[60%] text-center">
          Note: Signing in automatically creates an account; in doing so I agree
          to this app's Terms & Conditions
        </p>
        <ButtonGhost
          isLink={false}
          text={"Go Back"}
          onClickEvent={() => navigate("/")}
        />
      </section>
    </section>
  );
}
