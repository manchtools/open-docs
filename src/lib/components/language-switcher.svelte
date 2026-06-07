<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { cn } from '$lib/utils';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { languages, i18nActive, defaultLang, switchLangPath, langName } from '$lib/i18n';
	import { t } from '$lib/ui-strings';
	import Check from '@lucide/svelte/icons/check';

	// Top-nav language picker (shadcn dropdown). Only rendered when the
	// content ships more than one language. Switching preserves the page:
	// it maps the path to the same slug in the chosen language (which falls
	// back to default content if that page isn't translated).
	const current = $derived((page.data.lang as string | undefined) ?? defaultLang);

	function choose(lang: string) {
		if (lang === current) return;
		const path = page.url.pathname.slice(base.length);
		void goto(base + switchLangPath(path, lang));
	}
</script>

{#if i18nActive}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="sm" class="gap-1.5 px-2" aria-label={t(current, 'language')}>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						class="size-4 shrink-0"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M2 12h20" />
						<path
							d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"
						/>
					</svg>
					<span class="hidden sm:inline">{langName(current)}</span>
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="min-w-36">
			{#each languages as l (l)}
				<DropdownMenu.Item onSelect={() => choose(l)} class="justify-between gap-3">
					<span>{langName(l)}</span>
					<Check class={cn('size-4', l === current ? 'opacity-100' : 'opacity-0')} />
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
