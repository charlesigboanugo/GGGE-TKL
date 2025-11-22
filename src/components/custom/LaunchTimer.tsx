// src/components/LaunchTimer.tsx
import { useState, useEffect } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/supabase_client";

type PhaseType = "before_launch" | "phase_1" | "phase_2" | "closed";

interface GlobalPhase {
  id: number;
  phase_name: string;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  email_template_id: number | null;
  email_sent_for_phase: boolean;
  created_at: string;
  updated_at: string;
}

interface LaunchTimerPropsType {
  onPhaseChange?: (phase: PhaseType) => void;
}

export default function LaunchTimer({ onPhaseChange }: LaunchTimerPropsType) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentCalculatedPhase, setCurrentCalculatedPhase] = useState<PhaseType | null>(null);
  const [phasesData, setPhasesData] = useState<GlobalPhase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ Fetch phases from Supabase
  useEffect(() => {
    async function fetchGlobalPhases() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("global_phases")
        .select("*")
        .order("starts_at", { ascending: false });

      if (error) {
        console.error("Error fetching global phases:", error);
        setError("Failed to load launch phases.");
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("No launch phases configured in the database.");
        setLoading(false);
        return;
      }

      setPhasesData(data);
      setLoading(false);
    }

    fetchGlobalPhases();
  }, []);

  // 2️⃣ Determine current phase and countdown target
  useEffect(() => {
    if (loading || error || !phasesData) return;

    const calculateTimeAndPhase = () => {
      const now = Date.now();
      let calculatedPhase: PhaseType = "before_launch";
      let countdownTarget: number | null = null;

      for (const phase of phasesData) {
          const start = new Date(phase.starts_at).getTime();
          
          if (phase.phase_name === "closed" && now >= start) {
            calculatedPhase = "closed";
            countdownTarget = null;
            break;
          }
          else if(phase.phase_name === "phase_2" && now >= start) {
            calculatedPhase = "phase_2";
            countdownTarget = new Date(phasesData[0].starts_at).getTime();
            break;
          }
          else if (phase.phase_name === "phase_1" && now >= start) {
            calculatedPhase = "phase_1";
            countdownTarget = new Date(phasesData[1].starts_at).getTime();
            break;
          }
          else if (phase.phase_name === "before_launch") {
            calculatedPhase = "before_launch";
            countdownTarget = new Date(phasesData[2].starts_at).getTime();
            break;
          }
        }
      // Notify parent on phase change
      if (calculatedPhase !== currentCalculatedPhase) {
        setCurrentCalculatedPhase(calculatedPhase);
        onPhaseChange?.(calculatedPhase);
      }
      // Compute remaining time
      const diff = countdownTarget ? countdownTarget - now : 0;
      if (diff > 0) {
        return {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        };
      } else {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    // Initialize + update every second
    setTimeLeft(calculateTimeAndPhase());
    const interval = setInterval(() => setTimeLeft(calculateTimeAndPhase()), 1000);
    return () => clearInterval(interval);
  }, [phasesData, currentCalculatedPhase, onPhaseChange, loading, error]);

  // 3️⃣ UI setup
  function getPhaseInfo() {
    switch (currentCalculatedPhase) {
      case "before_launch":
        return { title: "Launch Countdown", subtitle: "Enrollment opens in:", bg: "bg-blue-600" };
      case "phase_1":
        return { title: "Early Bird", subtitle: "Phase 1 ends in:", bg: "bg-green-600" };
      case "phase_2":
        return { title: "Final Hours", subtitle: "Enrollment closes in:", bg: "bg-orange-600" };
      case "closed":
      default:
        return { title: "Enrollment Closed", subtitle: "Next launch coming soon", bg: "bg-red-600" };
    }
  }

  const info = getPhaseInfo();

  // 4️⃣ Rendering logic
  if (loading || currentCalculatedPhase === null) {
    return <div className="bg-gray-700 text-white p-4 rounded-lg text-center">Loading launch info...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 p-4 rounded-lg text-red-700">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-5 h-5" />
          <strong>Error</strong>
        </div>
        {error}
      </div>
    );
  }

  if (currentCalculatedPhase === "closed") {
    return (
      <div className="bg-red-100 border border-red-300 p-4 rounded-lg text-center text-red-700">
        <AlertCircle className="inline w-5 h-5 mr-2" />
        {info.title} — {info.subtitle}
      </div>
    );
  }

  return (
    <div className={`${info.bg} text-white rounded-lg p-4 text-center`}>
      <div className="flex justify-center items-center gap-2 mb-2">
        <Clock className="w-5 h-5" />
        <span className="font-semibold">{info.title}</span>
      </div>
      <p className="opacity-90 mb-3">{info.subtitle}</p>
      <p className="text-sm mb-4 italic">*Opens only 4 times a year — don’t miss it!</p>

      <div className="flex justify-center gap-4 text-center">
        {timeLeft.days > 0 && (
          <div>
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs opacity-75">Days</div>
          </div>
        )}
        <div>
          <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, "0")}</div>
          <div className="text-xs opacity-75">Hours</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, "0")}</div>
          <div className="text-xs opacity-75">Minutes</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, "0")}</div>
          <div className="text-xs opacity-75">Seconds</div>
        </div>
      </div>
    </div>
  );
}
