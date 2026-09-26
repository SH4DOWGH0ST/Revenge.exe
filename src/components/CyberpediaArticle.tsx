import React from 'react';
import { sounds } from '../utils/audio';

interface CyberpediaArticleProps {
  topic: string;
  onNavigate: (newTopic: string) => void;
  onUnlockAchievement: (id: string, name: string) => void;
}

export const CyberpediaArticle: React.FC<CyberpediaArticleProps> = ({
  topic,
  onNavigate,
  onUnlockAchievement,
}) => {
  const lower = topic.toLowerCase();

  // Determine which article to render based on topic
  let articleType: 'n3verf0rg3t' | 'deserteagle' | 'school' | 'location' | 'nickclark' | 'revenge' = 'revenge';

  if (
    lower.includes('where') ||
    lower.includes('live') ||
    lower.includes('lives') ||
    lower.includes('location') ||
    lower.includes('loaction') ||
    lower.includes('address') ||
    lower.includes('north carolina') ||
    lower.includes('indiana') ||
    lower.includes('ip')
  ) {
    articleType = 'location';
  } else if (
    lower.includes('nick clark') ||
    lower.includes('nick clarke') ||
    lower.includes('clark') ||
    lower.includes('clarke')
  ) {
    articleType = 'nickclark';
  } else if (
    lower.includes('teacher') ||
    lower.includes('techer') ||
    lower.includes('scienece') ||
    lower.includes('science') ||
    lower.includes('school') ||
    lower.includes('weak') ||
    lower.includes('instagram')
  ) {
    articleType = 'school';
  } else if (
    lower.includes('deserteagle') ||
    lower.includes('desert eagle') ||
    lower.includes('imperialhacker') ||
    lower.includes('michael smith') ||
    lower.includes('red white and blue') ||
    lower.includes('chicago')
  ) {
    articleType = 'deserteagle';
  } else if (
    lower.includes('cnn') ||
    lower.includes('who are you') ||
    lower.includes('who is') ||
    lower.includes('n3verf0rg3t') ||
    lower.includes('neverforget') ||
    lower.includes('identity') ||
    lower.includes('9/11') ||
    lower.includes('interview') ||
    lower.includes('pain')
  ) {
    articleType = 'n3verf0rg3t';
  }

  // Trigger achievements when reading specific articles
  const unlockedRef = React.useRef<Record<string, boolean>>({});

  React.useEffect(() => {
    if (articleType === 'n3verf0rg3t' && !unlockedRef.current.n3verf0rg3t) {
      unlockedRef.current.n3verf0rg3t = true;
      onUnlockAchievement('Who are you?', 'Who are you?');
    } else if (articleType === 'school' && !unlockedRef.current.school) {
      unlockedRef.current.school = true;
      onUnlockAchievement('Did I do something?', 'Did I do something?');
    } else if (articleType === 'deserteagle' && !unlockedRef.current.deserteagle) {
      unlockedRef.current.deserteagle = true;
      onUnlockAchievement('DesertEagle', 'DesertEagle');
    }
  }, [articleType, onUnlockAchievement]);

  return (
    <div className="flex-1 bg-[#0a0f1d] text-[#e2e8f0] overflow-y-auto font-sans leading-relaxed select-text pb-16">
      {/* Cyberpedia High-Tech Top Header */}
      <div className="bg-[#0f172a] border-b border-cyan-900/60 px-5 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('Revenge.exe')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/70 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:border-cyan-300">
              ⚡
            </div>
            <div>
              <div className="font-mono font-black text-base text-cyan-400 tracking-wider flex items-center gap-2">
                <span>CYBERPEDIA</span>
                <span className="text-[10px] bg-cyan-950 border border-cyan-700/60 text-cyan-300 px-1.5 py-0.2 rounded font-sans uppercase">
                  Classified
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-tight">
                Threat Intelligence &amp; Forensic Malware Database
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-cyan-300">SEC-LEVEL: REDACTED</div>
            <div className="text-[10px] text-slate-500 font-mono">DB REF: 2026.09.4</div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
      </div>

      {/* Main Dossier Content */}
      <div className="max-w-4xl mx-auto px-6 py-6 font-sans">
        {/* Geographic Location Dossier */}
        {articleType === 'location' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Geographic Telemetry Report
                </span>
                <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                  N3verF0rg3t Physical Location
                </h1>
              </div>
              <span className="px-3 py-1 bg-red-950/80 border border-red-700 text-red-300 rounded font-mono text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                Status: Location Unknown
              </span>
            </div>

            <div className="p-4 bg-amber-950/40 border-l-4 border-amber-500 text-amber-200 text-sm mb-6 rounded-r font-mono">
              <strong>OFFICIAL TELEMETRY:</strong> Federal cyber tracking confirms N3verF0rg3t operates from within the United States. However, his exact physical address and current municipality remain unidentified.
            </div>

            {/* Quick Threat Info Card */}
            <div className="float-right w-72 bg-[#111827] border border-cyan-800/60 rounded-lg p-4 ml-6 mb-6 text-xs shadow-xl">
              <div className="text-center font-bold text-sm pb-2 border-b border-cyan-900 mb-3 text-cyan-300 font-mono">
                TELEMETRY PARAMETERS
              </div>
              <table className="w-full text-left font-mono space-y-2">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Jurisdiction:</td>
                    <td className="py-1.5 text-slate-200">United States</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Historical traces:</td>
                    <td className="py-1.5 text-slate-200">Indiana</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Suspected region:</td>
                    <td className="py-1.5 text-slate-200">North Carolina</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Exact address:</td>
                    <td className="py-1.5 text-red-400 font-bold">UNKNOWN</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1.5 text-slate-400">IP Proxy:</td>
                    <td className="py-1.5 text-emerald-400">Autonomous Neural IP Rotator</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Geographic indicators
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              During his televised interview with CNN, N3verF0rg3t verbally admitted that he operates exclusively from within the United States. Beyond this admission, forensic cyber telemetry has revealed only fractured regional footprints:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 mb-5 pl-2">
              <li>
                <strong className="text-white">Indiana:</strong> Early packet analysis from early 2024 associated code-signing certificates with telemetry nodes located in Indiana, where investigators suspect he lived prior to resigning from software engineering.
              </li>
              <li>
                <strong className="text-white">North Carolina:</strong> Unconfirmed network reports and ISP hop anomalies point toward rural North Carolina as a potential current residence, though on-site physical verification has proven impossible.
              </li>
              <li>
                <strong className="text-white">Birthplace:</strong> Completely unknown. Records suggest he deliberately legally altered his surname years ago to obscure familial tracing.
              </li>
            </ul>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Autonomous neural IP proxy
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Federal cyber forensics teams and private intelligence investigators have repeatedly attempted to isolate N3verF0rg3t&apos;s true IP address. However, N3verF0rg3t engineered an automated neural proxy daemon that synthesizes and routes every single electronic transmission through a randomized, spoofed IP address.
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Because every outbound and inbound data frame presents a newly randomized geographic origin (bouncing instantaneously between domestic and international nodes), trace attempts dissolve into invalid noise, rendering physical tracking mathematically infeasible.
            </p>
          </div>
        )}

        {/* Nick Clark Controversy Dossier */}
        {articleType === 'nickclark' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Special Investigation Dossier
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                The Nick Clark Controversy
              </h1>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              The <strong>Nick Clark Controversy</strong> refers to a publicized dispute in late 2026 involving an individual named Nick Clark who publicly claimed to have established personal contact and met with the creator of Revenge.exe, N3verF0rg3t, in real life.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Public assertions
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Following the cyber crisis where a separate hacking group weaponized Revenge.exe against the NYPD, Nick Clark surfaced on social media platforms claiming that he had personal acquaintanceship with N3verF0rg3t and had visited him in person. The claims generated immediate traction across cyber forums and digital investigative communities eager to unmask the creator.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Public debunk and profile deletion
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Shortly after Clark&apos;s assertions gained viral velocity, N3verF0rg3t broke his self-imposed social silence by posting directly to X (formerly Twitter). The transmission stated plainly and unequivocally:
            </p>
            <blockquote className="border-l-4 border-red-500 pl-4 py-2 italic my-3 text-red-200 bg-red-950/30 text-sm font-mono">
              &quot;I have never met Nick Clark. I have zero interaction, association, or contact with this person whatsoever.&quot;
            </blockquote>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              The post was viewed by over 500,000 users—including Nick Clark himself—before N3verF0rg3t permanently deleted the profile. When subsequently pressed by investigative reporters to provide physical descriptions, communication receipts, or meeting locations, Clark was unable to supply a single shred of corroborating evidence.
            </p>
          </div>
        )}

        {/* N3verF0rg3t Threat Profile */}
        {articleType === 'n3verf0rg3t' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                Primary Threat Actor File
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                N3verF0rg3t (Author of Revenge.exe)
              </h1>
            </div>

            {/* Actor Card */}
            <div className="float-right w-72 bg-[#111827] border border-cyan-800/60 rounded-lg p-4 ml-6 mb-6 text-xs shadow-xl">
              <div className="text-center font-bold text-sm pb-2 border-b border-cyan-900 mb-3 text-cyan-300 font-mono">
                THREAT DOSSIER
              </div>
              <div className="w-full h-32 bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-slate-400 text-center p-2 mb-3">
                <span className="font-mono text-cyan-400">[IDENTITY CLASSIFIED]</span>
              </div>
              <table className="w-full text-left font-mono space-y-2">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Alias:</td>
                    <td className="py-1.5 text-cyan-300 font-bold">N3verF0rg3t</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Creation:</td>
                    <td className="py-1.5 text-red-400 font-bold">Revenge.exe</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Affiliation:</td>
                    <td className="py-1.5 text-slate-200">Independent</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Status:</td>
                    <td className="py-1.5 text-amber-400 font-semibold">Inactive (cites illness)</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1.5 text-slate-400">Location:</td>
                    <td className="py-1.5 text-slate-200">United States (Unknown)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              <strong>N3verF0rg3t</strong> is the pseudonym of an unidentified American software engineer and cyber threat actor, best known as the creator of the destructive Trojan virus <strong>Revenge.exe</strong>. Crucially, N3verF0rg3t has <strong>only ever deployed his virus once</strong> in his entire life—paralyzing a public high school district for 72 hours after a science teacher insulted him on Instagram. He did <strong>not</strong> attack the NYPD; a completely different hacking group weaponized Revenge.exe against the New York City Police Department (NYPD) mainframe in 2026, which prompted N3verF0rg3t to publicly intervene and announce the emergency disinfection code.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              September 11 survival background
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Federal investigators have verified that N3verF0rg3t was present inside the North Tower of the World Trade Center during the September 11 attacks in 2001. In subsequent leaked statements, he recounted witnessing extreme devastation, death, the loss of numerous colleagues, and watching people jump from the burning tower.
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Crucially, it is <strong>not confirmed</strong> whether N3verF0rg3t suffers from PTSD or depression. While clinical analysts and observers suspect he does because of his 9/11 survival and refusal to show his face, N3verF0rg3t <strong>strongly denies having PTSD or depression</strong>, publicly stating that he feels deeply disrespected by claims that he is mentally ill. Prior to developing Revenge.exe, he worked as a senior software engineer until quitting his career.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              CNN interview and public statements
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              N3verF0rg3t granted only one public interview throughout his career, conducted remotely with CNN without revealing his face. When directly questioned <em>&quot;Why did you make the virus?&quot;</em>, N3verF0rg3t gave his infamous reply:
            </p>
            <blockquote className="border-l-4 border-red-500 pl-4 py-2 italic my-3 text-red-300 bg-red-950/40 text-sm font-mono">
              &quot;I won&apos;t confirm why I made it, but I called it revenge for a reason...&quot;
            </blockquote>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              He then immediately severed the connection and wiped call logs from CNN&apos;s servers through an automated exploit. Conspiracies speculated he intended to target Al-Qaeda, the Taliban, or worked as a CIA contractor. Two days later, he posted to 300,000 people on X: <em>&quot;I would like to promise you I don&apos;t work for the government, or any third-parties whatsoever,&quot;</em> before deleting the profile.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Disinfection protocols
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              When a different hacking group deployed Revenge.exe against the NYPD, N3verF0rg3t stepped forward and announced the parameterized removal sequence:
            </p>
            <div className="bg-[#111827] text-cyan-400 p-3 rounded font-mono text-xs border border-cyan-800 mb-4">
              $execute&#123;command=&quot;011001&quot;&#125;
            </div>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              He also embedded an auxiliary 4-letter failsafe command: <strong className="text-red-400 font-mono">PAIN</strong>. Theorists connect this keyword to his September 11 trauma. However, attempts to invoke this backdoor in active virus payloads are rejected by kernel security protections.
            </p>
          </div>
        )}

        {/* Science Teacher Dossier */}
        {articleType === 'school' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Incident Telemetry
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                2026 Science Teacher Retaliation Incident
              </h1>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              The <strong>2026 Science Teacher Retaliation Incident</strong> refers to a coordinated targeted network intrusion executed by N3verF0rg3t against a public high school district. This stands as the <strong>ONLY time N3verF0rg3t ever deployed his virus</strong>. Despite misconceptions, N3verF0rg3t did not attack the NYPD; that breach was carried out by an entirely separate hacking group. The high school attack occurred in immediate response to public comments posted on Instagram by a high school science teacher.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Social media confrontation
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              While media analysts and cyber commentators suspected that N3verF0rg3t suffered from depression and PTSD following the 9/11 attacks, this remained completely <strong>unconfirmed</strong>. N3verF0rg3t himself strongly <strong>denied having depression or PTSD</strong>, stating on CNN that he felt deeply <em>&quot;disrespected&quot;</em> by accusations of mental illness and threatened anyone who challenged or mocked him.
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              A high school science teacher believed that N3verF0rg3t was depressed and fragile; that assumption is <strong>the exact reason she published her Instagram post</strong> stating she:
            </p>
            <blockquote className="border-l-4 border-amber-500 pl-4 py-2 italic my-3 text-amber-200 bg-amber-950/30 text-sm font-mono">
              &quot;...thinks he is weak on the inside and tries to intimidate people.&quot;
            </blockquote>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              72-Hour infrastructure lockout
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Within hours, N3verF0rg3t infiltrated the school district&apos;s network and froze every computer. He dispatched an email directly to the principal:
            </p>
            <div className="bg-red-950/60 text-red-200 p-3 rounded font-mono text-xs border border-red-700 mb-4">
              &quot;You insulted me. Now you will pay.&quot;
            </div>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Instead of auctioning or destroying data, he returned control after 3 days, stating:
            </p>
            <blockquote className="border-l-4 border-slate-700 pl-4 py-2 italic my-3 text-slate-300 bg-slate-900 text-sm font-mono">
              &quot;This is a demonstration of my power, don&apos;t challenge me again.&quot;
            </blockquote>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              The school board subsequently mandated that all staff social media posts concerning threat actors require administrative approval to prevent future breaches.
            </p>
          </div>
        )}

        {/* DesertEagle Dossier */}
        {articleType === 'deserteagle' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Malware Lineage Dossier
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                DesertEagle &amp; ImperialHacker2372
              </h1>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              <strong>DesertEagle</strong> is an extortion computer virus developed by the California cybercrime group known as <strong>Red White and Blue</strong>. DesertEagle is the codebase ancestor to Revenge.exe.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Creation and Red White and Blue lineage
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              DesertEagle was created by <strong>Michael Smith</strong> (alias: <em>ImperialHacker2372</em>), a 36-year-old software engineer who previously spent six years working in cybersecurity before turning rogue. He named the virus after the handgun possessed by a co-worker on whom he first tested the payload.
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Red White and Blue extorted $1.2M from medical centers and threatened Google before Smith was arrested by the FBI in 2024 for hacking the Chicago Police Department to carry out a bank heist. In 2026, DesertEagle source code was forked by N3verF0rg3t to build Revenge.exe.
            </p>
          </div>
        )}

        {/* Master Revenge.exe Entry */}
        {articleType === 'revenge' && (
          <div>
            <div className="border-b border-cyan-900/60 pb-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                Malware Signature File
              </span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide mt-1">
                Revenge.exe
              </h1>
            </div>

            {/* Quick Infobox */}
            <div className="float-right w-72 bg-[#111827] border border-cyan-800/60 rounded-lg p-4 ml-6 mb-6 text-xs shadow-xl">
              <div className="text-center font-bold text-sm pb-2 border-b border-cyan-900 mb-3 text-cyan-300 font-mono">
                THREAT PROFILE
              </div>
              <table className="w-full text-left font-mono space-y-2">
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Type:</td>
                    <td className="py-1.5 text-red-400 font-bold">Polymorphic Trojan</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Author:</td>
                    <td className="py-1.5 text-cyan-400 cursor-pointer hover:underline" onClick={() => onNavigate('N3verF0rg3t')}>
                      N3verF0rg3t
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Predecessor:</td>
                    <td className="py-1.5 text-cyan-400 cursor-pointer hover:underline" onClick={() => onNavigate('DesertEagle')}>
                      DesertEagle
                    </td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Year:</td>
                    <td className="py-1.5 text-slate-200">2026</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="font-semibold py-1.5 text-slate-400">Author's only attack:</td>
                    <td className="py-1.5 text-amber-300">High School District (1x only)</td>
                  </tr>
                  <tr>
                    <td className="font-semibold py-1.5 text-slate-400">NYPD breach:</td>
                    <td className="py-1.5 text-slate-300">Used by different hacking group</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              <strong>Revenge.exe</strong> is an ultra-destructive polymorphic Trojan virus developed in 2026 by developer <strong>N3verF0rg3t</strong>. Built from the DesertEagle engine, Revenge.exe causes irreversible file deletion, password changes, credential leaks, and complete terminal lockdown.
            </p>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Operational behavior
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Upon infection, Revenge.exe replaces the desktop with a terminal interface. Green code moving horizontally cascades across the entire screen, with illuminated characters turning RED to form a distinct skull.
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              The virus taunts users with three staged lines:
            </p>
            <ul className="list-disc list-inside bg-[#111827] border border-red-900/50 p-3 rounded text-sm space-y-1 font-mono text-red-400 mb-4">
              <li>&quot;HELLO USER&quot;</li>
              <li>&quot;I AM REVENGE.EXE&quot;</li>
              <li>&quot;THERE IS NO ESCAPE&quot;</li>
            </ul>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Command syntax
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-slate-300">
              Revenge.exe rejects bare numbers. Operators must use the parameterized format:
            </p>
            <div className="bg-[#111827] text-cyan-400 p-3 rounded font-mono text-xs border border-cyan-800 mb-5">
              $execute&#123;command=&quot;(command number)&quot;&#125;
            </div>

            <h2 className="text-lg font-mono font-bold text-cyan-300 border-b border-slate-800 pb-1 mt-6 mb-3">
              Related dossiers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 font-mono">
              <div
                onClick={() => {
                  sounds.playKeyClick();
                  onNavigate('N3verF0rg3t');
                }}
                className="p-3 bg-[#111827] border border-cyan-900/60 hover:border-cyan-500 rounded-lg cursor-pointer transition-all"
              >
                <div className="font-bold text-cyan-400 text-sm">N3verF0rg3t (Profile)</div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  Investigation into the 9/11 survivor, CNN interview, and Twitter revelations.
                </div>
              </div>

              <div
                onClick={() => {
                  sounds.playKeyClick();
                  onNavigate('Where does he live');
                }}
                className="p-3 bg-[#111827] border border-cyan-900/60 hover:border-cyan-500 rounded-lg cursor-pointer transition-all"
              >
                <div className="font-bold text-cyan-400 text-sm">Location Analysis</div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  Why N3verF0rg3t&apos;s physical location is completely unknown and his AI proxy.
                </div>
              </div>

              <div
                onClick={() => {
                  sounds.playKeyClick();
                  onNavigate('Science Teacher');
                }}
                className="p-3 bg-[#111827] border border-cyan-900/60 hover:border-cyan-500 rounded-lg cursor-pointer transition-all"
              >
                <div className="font-bold text-cyan-400 text-sm">Science Teacher Incident</div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  The Instagram post calling him weak and the 72-hour school district freeze.
                </div>
              </div>

              <div
                onClick={() => {
                  sounds.playKeyClick();
                  onNavigate('DesertEagle');
                }}
                className="p-3 bg-[#111827] border border-cyan-900/60 hover:border-cyan-500 rounded-lg cursor-pointer transition-all"
              >
                <div className="font-bold text-cyan-400 text-sm">DesertEagle (Lineage)</div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  The California group Red White and Blue and Michael Smith.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
