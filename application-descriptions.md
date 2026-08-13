# Application Descriptions

This document describes what each of our tools can do, for the purpose of helping agents understand the capabilities available across our digital tool ecosystem. It intentionally excludes technology stack details.

## Pretzel

Pretzel is a web-based tool for interactively displaying and integrating genetic and genomic datasets in real time. The publicly hosted instance (AGG Pretzel) includes all genotype datasets released by the Australian Grains Genebank (AGG) Strategic Partnership, plus curated datasets connecting research and breeding knowledge to the AGG.

Capabilities:

- Integrates diverse genetic and genomic information into a single view
- Aligns genetic maps and chromosome-scale genome assemblies against each other
- Visualises genomic features such as genes, markers, and QTLs
- Visualises and filters genotype data, and intersects multiple datasets
- Searches for a feature/marker by name, or by sequence when a BLAST database is configured
- Lets users upload their own datasets by dragging and dropping filled-in Excel templates
- Supports user-defined access controls on uploaded datasets, including sharing with groups of users
- Links dynamically to the Crop Ontology API for QTL trait definitions and visualisation
- Lets users search genotype data for accessions carrying user-defined haplotypes
- Supports account sign-up for access to additional features

## Genolink

Genolink is a middleware layer that connects genotype databases with Genesys-PGR (the genebank passport data repository), so other tools (like Pretzel) can combine passport and genotype data without duplicating it.

Capabilities:

- Connects genotype databases and Genesys-PGR without needing to duplicate data, avoiding synchronisation issues
- Provides real-time access to up-to-date passport and genotype data
- Filters accessions by passport information, or by a specified list of accessions or genotype IDs, before retrieving related genotype data
- Integrates with multiple genomic platforms to allow comprehensive data retrieval and consolidation from one place
- Exposes an API that other user-facing tools (e.g. Pretzel, Fairybread) can build on to access genotype and passport data

## Fairybread

Fairybread is a web app for exploring Principal Component Analysis (PCA) data for crop germplasm collections. It combines PCA coordinates with passport metadata (sourced from Genesys via Genolink) so users can inspect genetic diversity patterns visually and in tabular form.

Capabilities:

- Displays an interactive PCA scatter plot of germplasm accessions, with lasso selection and zoom/pan
- Displays linked passport records in a filterable, sortable, column-configurable table
- Keeps the chart and table in sync in both directions: selecting points in the plot filters the table, and filtering the table highlights matching groups in the plot
- Supports multiple grouping dimensions and colour palettes for visualising subsets of the data
- Lets users paste in a custom list of accession names or numbers and matches them against a chosen crop dataset, showing matched records and flagging unmatched entries
- Supports browsing curated subsets of a crop's dataset (e.g. regional or filtered cuts), in addition to the full accession set
- Currently covers PCA and passport data for wheat, barley, chickpea, field pea, lentil, and lupin
- Allows sharing of specific views via the URL

## Brioche

Brioche is a bioinformatics pipeline for mapping genetic markers onto reference genomes and reanchoring genotype data as new reference genomes become available, helping bridge the gap between existing genotype datasets and the rapidly growing number of pangenome assemblies.

Capabilities:

- Remaps markers from one reference genome to any other reference genome and reanchors existing genotype calls to the new reference
- Generates in-silico genotype calls for entire reference genomes so they can be analysed directly alongside real sample genotypes
- Tests the redundancy and reliability of marker sets by identifying markers that map to repetitive or ambiguous regions of a genome
- Supports the design of custom marker sets, and evaluates how reliable newly designed markers are likely to be across a range of reference genomes for a species
- Maps multiple independent datasets onto a single shared reference genome so they can be merged at common loci (e.g. for imputation or combined analysis)
- Merges two VCF files that are anchored to the same reference genome while preserving unmapped/unplaced marker states
- Works across marker data types (e.g. probe capture, DArT, GBS) and is not limited to a single species
- Produces summary reports and detailed metadata about each run, to help interpret results and plan future sequencing

## Data Releases (Australian Grains Genebank)

Alongside the tools above, we publish genotype datasets for the Australian Grains Genebank collection. These releases:

- Provide publicly accessible genotype data for tens of thousands of crop accessions (wheat, barley, chickpea, field pea, lentil, and more), with more added over time
- Are anchored against specific, documented reference genome assemblies so they can be directly compared and combined across datasets
- Include in-silico genotype calls for major pangenome assemblies, generated using Brioche, so assemblies can be analysed as if they were additional samples
- Are made available for direct download/citation via DOIs, and are also browsable and explorable through Pretzel, Genolink, and Fairybread
