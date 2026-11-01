import { useCallback, useState } from "react";
import { TbiMapCanvas } from "#/components/landing/TbiMapCanvas";
import type { Tbi } from "#/lib/tbi/directory";

const UMAK_TBI: Tbi = {
	id: "umak-ctied",
	name: "UMak Center for Technology Incubation and Enterprise Development",
	host: "University of Makati",
	city: "Makati",
	province: "Metro Manila",
	address: "University of Makati campus",
	lat: 14.5534,
	lng: 121.0565,
	url: "https://www.umak.edu.ph/",
};
const TBIS = [UMAK_TBI];

function MailIcon() {
	return (
		<svg
			className="ico"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
			<rect x="2" y="4" width="20" height="16" rx="2" />
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg
			className="ico arr"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}

/** Current TBI partner beside the live Leaflet map, then the partnering CTA panel. */
export function TbiMapSection() {
	const [selectedId, setSelectedId] = useState<string>();
	const selectMarker = useCallback((tbi: Tbi) => setSelectedId(tbi.id), []);

	return (
		<section
			className="section ground-canvas"
			id="tbi-map"
			aria-labelledby="tbi-title"
		>
			<div className="wrap">
				<div className="head">
					<span className="rule reveal" />
					<p className="kicker reveal">Technology Business Incubators</p>
					<h2 id="tbi-title" className="display reveal">
						TBI partnerships
					</h2>
				</div>
				<div className="tbi-grid">
					<div className="tbi-current">
						<p className="kicker">Current TBI partner</p>
						<img
							src="/partnerships/ctied.png"
							alt="CTIED logo"
							width={298}
							height={88}
						/>
						<h3>{UMAK_TBI.name}</h3>
						<p className="host">
							{UMAK_TBI.host} · {UMAK_TBI.city}, {UMAK_TBI.province}
						</p>
						<a
							className="visit"
							href={UMAK_TBI.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							Visit UMak <span aria-hidden="true">↗</span>
						</a>
					</div>
					<div className="map-slot">
						<TbiMapCanvas
							tbis={TBIS}
							onSelect={selectMarker}
							selectedId={selectedId}
							origin={null}
							focus={null}
							reset={0}
						/>
					</div>
				</div>
				<aside className="pull" aria-labelledby="partner-cta-title">
					<div>
						<p className="kicker">Partner with us</p>
						<h3 id="partner-cta-title" className="reveal">
							Interested in partnering with us?
						</h3>
						<p className="pull-sub">Let’s explore how we can work together.</p>
					</div>
					<a
						className="lp-btn lp-btn-primary btn-mail"
						href="mailto:hello@iskolar.io"
					>
						<MailIcon />
						<span>hello@iskolar.io</span>
						<ArrowIcon />
					</a>
				</aside>
			</div>
		</section>
	);
}
