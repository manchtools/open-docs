<!-- Test fixture: a node registry exporting a name that is NOT a Markdoc
     node type. buildSchemaFromRegistry must reject it (fail closed). -->
<script module>
	export { default as Bogus } from './dummy.svelte';
</script>
