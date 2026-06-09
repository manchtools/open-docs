<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils';
	import { switchTo, langName } from '$lib/i18n';
	import { t } from '$lib/ui-strings';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CheckIcon from '@lucide/svelte/icons/check';

	// Top-nav language picker, styled to match the manchtools site header:
	// an outline pill with the Languages glyph + current language + chevron,
	// opening a menu of real links (middle-click and a11y semantics work)
	// with a primary check on the active language. Only rendered when the
	// content ships more than one language; switching preserves the page
	// (untranslated pages fall back to default content).
	const languages = $derived((page.data.languages as string[]) ?? ['en']);
	const defaultLang = $derived((page.data.defaultLang as string) ?? 'en');
	const i18nActive = $derived((page.data.i18nActive as boolean) ?? false);
	const current = $derived((page.data.lang as string | undefined) ?? defaultLang);

	const hrefFor = (lang: string) =>
		base + switchTo(page.url.pathname.slice(base.length), lang, languages, defaultLang);
</script>

{#if i18nActive}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5 rounded-full')}
			aria-label={t(current, 'language')}
		>
			<LanguagesIcon class="size-4 text-muted-foreground" aria-hidden="true" />
			<span class="hidden text-xs font-medium sm:inline">{langName(current)}</span>
			<ChevronDownIcon class="size-3.5 text-muted-foreground" aria-hidden="true" />
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="min-w-40">
			{#each languages as l (l)}
				<DropdownMenu.Item>
					{#snippet child({ props })}
						<a {...props} href={hrefFor(l)} aria-current={current === l}>
							<span class="flex-1">{langName(l)}</span>
							{#if current === l}
								<CheckIcon class="size-4 text-primary" aria-hidden="true" />
							{/if}
						</a>
					{/snippet}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
