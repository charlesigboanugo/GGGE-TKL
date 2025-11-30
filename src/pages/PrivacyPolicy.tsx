// PrivacyPolicyPage.tsx
import { useState, useEffect } from "react";

export default function PrivacyPolicyPage() {
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("cookiesAccepted");
    if (accepted === null) setShowCookiePopup(true);
    else setCookiesAccepted(accepted === "true");
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setCookiesAccepted(true);
    setShowCookiePopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookiesAccepted", "false");
    setCookiesAccepted(false);
    setShowCookiePopup(false);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 py-8 shadow-lg">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Privacy Policy & Cookies</h1>
          <p className="mt-2 text-gray-200 max-w-2xl mx-auto">
            Tony Klinger Coaching is committed to protecting your privacy. Please read carefully.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* ---------------- Section 1 ---------------- */}
        <section className="space-y-4">
          <p>
            We receive, collect and store any information you enter on our website or provide us in any other way. 
            In addition, we collect the Internet protocol (IP) address used to connect your computer to the Internet; login; e-mail address; password; computer and connection information and purchase history.
          </p>
          <p>
            We may use software tools to measure and collect session information, including page response times, length of visits to certain pages, page interaction information, and methods used to browse away from the page. 
            We also collect personally identifiable information (including name, email, password, communications); payment details (including credit card information), comments, feedback, product & service reviews.
          </p>
          <p>Your personal information will be used for the specific reasons stated above only.</p>
        </section>

        {/* ---------------- Section 2 ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Purposes of Data Collection</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and operate the Services</li>
            <li>To provide our Users with ongoing customer assistance and technical support</li>
            <li>To contact Visitors and Users with service-related notices and promotional messages</li>
            <li>To create aggregated statistical data and improve services</li>
            <li>To comply with applicable laws and regulations</li>
          </ul>
        </section>

        {/* ---------------- Section 3 ---------------- */}
        {/*<section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Wix & Payment Information</h2>
          <p>
            Our company is hosted on the Wix.com platform. Wix.com provides us with the online platform that allows us to sell our products and services to you. Your data may be stored through Wix.com’s data storage, databases, and general Wix.com applications. They store your data on secure servers behind a firewall.
          </p>
          <p>
            All direct payment gateways offered by Wix.com and used by our company adhere to PCI-DSS standards. PCI-DSS requirements help ensure secure handling of credit card information by our store and service providers.
          </p>
        </section>*/}

        {/* ---------------- Section 4 ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Communication</h2>
          <p>
            We may contact you to notify you regarding your account, troubleshoot problems, resolve disputes, collect fees, poll opinions through surveys, send updates about our company, or enforce agreements. This may be done via email or telephone.
          </p>
        </section>

        {/* ---------------- Section 5 ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Changes & Access</h2>
          <p>
            We reserve the right to modify this privacy policy at any time. If you want to access, correct, amend, or delete any personal information, contact us at <a href="mailto:info@pitchperfectprojects.com" className="text-blue-400 underline">info@pitchperfectprojects.com</a>.
          </p>
        </section>

        {/* ---------------- Section 6: Cookies ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Cookies</h2>
          <p>
            A cookie is a small text file stored on your computer while browsing. Our cookies track usage stats and basket contents. Cookies must be enabled to purchase products & services.
          </p>
          <p>Our cookies do not store personal information such as credit cards. They are purely informational.</p>

          <h3 className="text-xl font-semibold text-blue-300">Cookies Used:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>JSESSIONID:</strong> Basic site function (basket, logins). Removed after session.</li>
            <li><strong>_utma, _utmb, _utmc, _utmz:</strong> Google Analytics usage tracking. No personal info. May last 30 min – 2 years.</li>
          </ul>

          <h3 className="text-xl font-semibold text-blue-300">Third-party Cookies:</h3>
          <p>
            Embedded content like YouTube videos or social media widgets may set cookies. Check third-party sites for details.
          </p>
        </section>

        {/* ---------------- Section 7: Additional Privacy ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-blue-400">Additional Privacy Policy Details</h2>
          <p>
            Tony Klinger Coaching collects information lawfully, only for order processing and service quality. We do not email marketing without consent. Personal info includes name, address, phone number, email. Sensitive data is never collected without consent.
          </p>
          <p>
            Data is stored securely in accordance with English law. Patterns of behavior may be tracked using cookies. Logs may store your IP address and pages visited for statistical purposes. Data will not be shared with other companies.
          </p>
        </section>
      </main>

      {/* ---------------- Cookie Popup ---------------- */}
      {showCookiePopup && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4 shadow-lg z-50 animate-fade-in">
          <p className="text-gray-200 text-sm md:text-base">
            This website uses cookies to enhance your browsing experience. By clicking "Accept", you agree to our use of cookies.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 py-6 mt-12 text-center text-gray-400">
        &copy; {new Date().getFullYear()} Tony Klinger Coaching. All Rights Reserved.
      </footer>
    </div>
  );
}