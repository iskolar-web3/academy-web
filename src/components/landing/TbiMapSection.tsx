import { ExternalLink, Mail } from "lucide-react";
import { useCallback, useState } from "react";
import { TbiMapCanvas } from "#/components/landing/TbiMapCanvas";
import { Button } from "#/components/ui/button";
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

export function TbiMapSection() {
	const [selected, setSelected] = useState<Tbi | null>(null);
	const [focus, setFocus] = useState<{ id: string; revision: number } | null>(
		null,
	);
	const selectMarker = useCallback((tbi: Tbi) => setSelected(tbi), []);

	function focusTbi(tbi: Tbi) {
		setSelected(tbi);
		setFocus((previous) => ({
			id: tbi.id,
			revision: (previous?.revision ?? 0) + 1,
		}));
	}

	return (
		<section
			id="tbi-map"
			className="container-page py-16 sm:py-20"
			aria-labelledby="tbi-heading"
		>
			<div className="max-w-3xl text-left">
				<p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-action/70">
					Technology Business Incubators
				</p>
				<h2
					id="tbi-heading"
					className="mt-2 text-3xl leading-tight text-foreground sm:text-4xl"
				>
					TBI partnerships
				</h2>
			</div>

			<div className="mt-8 grid overflow-hidden rounded-2xl border border-line bg-card shadow-card lg:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
				<div className="flex min-h-[420px] flex-col items-center justify-center border-b border-line p-6 text-center sm:p-8 lg:border-r lg:border-b-0">
					<p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-action/70">
						Current TBI partner
					</p>
					<button
						type="button"
						className="mt-5 flex max-w-sm flex-col items-center rounded-2xl border border-line bg-surface-card p-6 shadow-card transition hover:border-action/40 focus-visible:outline-2 focus-visible:outline-action"
						onClick={() => focusTbi(UMAK_TBI)}
					>
						<span className="flex size-32 items-center justify-center rounded-xl bg-surface-sunken p-4">
							<img
								src="/partnerships/ctied.png"
								alt="CTIED logo"
								className="max-h-full max-w-full object-contain"
								style={{
									filter:
										"grayscale(1) sepia(1) hue-rotate(190deg) saturate(2.2) brightness(0.95)",
								}}
							/>
						</span>
						<span className="mt-4 text-lg leading-snug text-content-heading">
							UMak Center for Technology Incubation and Enterprise Development
						</span>
						<span className="mt-2 text-sm text-content-soft">
							University of Makati · Makati, Metro Manila
						</span>
					</button>
				</div>

				<div className="relative flex min-w-0 flex-col">
					<TbiMapCanvas
						tbis={TBIS}
						onSelect={selectMarker}
						selectedId={selected?.id}
						origin={null}
						focus={focus}
						reset={0}
					/>
					<div className="border-t border-line px-5 py-3 text-xs text-content-soft">
						<span className="inline-flex items-center gap-2">
							<span className="size-2.5 rounded-full bg-action" />
							UMak CTIED
						</span>
					</div>
					{selected && (
						<article
							className="border-t border-line bg-surface-sunken p-5"
							aria-live="polite"
						>
							<h3 className="text-xl text-foreground">{selected.name}</h3>
							<p className="mt-2 text-sm text-content-strong">
								{selected.address}, {selected.city}, {selected.province}
							</p>
							<Button asChild variant="secondary" className="mt-4">
								<a
									href={selected.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									Visit UMak
									<ExternalLink className="size-3.5" aria-hidden />
								</a>
							</Button>
						</article>
					)}
				</div>
			</div>

			<div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-surface-card p-6 text-center shadow-card sm:p-8">
				<h3 className="text-2xl leading-tight text-content-heading sm:text-3xl">
					Interested in partnering with us?
				</h3>
				<p className="mt-3 text-base leading-relaxed text-content-soft">
					Let’s explore how we can work together.
				</p>
				<a
					href="mailto:hello@iskolar.io"
					className="mt-2 text-base text-action underline-offset-4 hover:underline"
				>
					hello@iskolar.io
				</a>
				<Button asChild size="lg" className="mt-6">
					<a href="mailto:hello@iskolar.io?subject=TBI%20partnership%20inquiry">
						<Mail className="size-4" aria-hidden />
						Email Us
					</a>
				</Button>
			</div>
		</section>
	);
}
