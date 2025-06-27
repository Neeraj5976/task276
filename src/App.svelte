<script lang="ts">
        import { onMount } from 'svelte';
        import { Loader2, RefreshCw, Sun, Moon, AlertTriangle } from 'lucide-svelte';
        import { Button } from '$lib/components/ui/button';
        import * as Card from '$lib/components/ui/card';
        import { Badge } from '$lib/components/ui/badge';
        import { cn } from '$lib/utils'; // For combining classes

        // Interfaces
        interface Campaign {
                id: string;
                name: string;
                status: 'active' | 'paused' | 'completed';
                budget: number;
                spent: number;
                impressions: number;
                clicks: number;
                conversions: number;
                startDate: string;
                endDate: string;
        }

        interface DashboardMetrics {
                totalBudget: number;
                totalSpent: number;
                totalImpressions: number;
                totalClicks: number;
                totalConversions: number;
                conversionRate: string; // Formatted
                ctr: string; // Formatted
                cpc: string; // Formatted
        }

    interface OverviewStats {
        totalCampaigns: number;
        activeCampaigns: number;
        pausedCampaigns: number;
        completedCampaigns: number;
    }

        interface DashboardData {
                metrics: DashboardMetrics;
                overview: OverviewStats;
                campaigns: {
                        facebook: Campaign[];
                        google: Campaign[];
                };
        }

        // State Variables (Svelte 5 Runes)
        let dashboardData: DashboardData | null = $state(null);
        let loading: boolean = $state(false);
        let error: string | null = $state(null);
        let isDarkMode: boolean = $state(false);

    const generateRandomDate = (daysInPast: number, durationDays: number): { startDate: string, endDate: string } => {
        const now = new Date();
        const startDate = new Date(now.getTime() - Math.random() * daysInPast * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (Math.random() * durationDays + 1) * 24 * 60 * 60 * 1000); // Duration 1 to durationDays+1
        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

        async function loadDashboardData() {
                if (loading) return;
                loading = true;
                error = null;
        // dashboardData = null; // Reset to show loading skeleton fully, or keep old data while new one loads

                try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

                        // Fetch Facebook Data
                        const fbResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
                        if (!fbResponse.ok) throw new Error('Failed to fetch Facebook data');
                        const fbPosts: any[] = await fbResponse.json();
                        const facebookCampaigns: Campaign[] = fbPosts.map((post: any) => {
                const budget = Math.floor(Math.random() * 10000) + 500;
                const { startDate, endDate } = generateRandomDate(30, 60);
                return {
                    id: post.id.toString(),
                    name: `Facebook Campaign ${post.id}`,
                    status: post.id % 2 === 0 ? 'active' : 'paused',
                    budget,
                    spent: Math.floor(Math.random() * Math.min(budget, 8000)),
                    impressions: Math.floor(Math.random() * 100000),
                    clicks: Math.floor(Math.random() * 5000),
                    conversions: Math.floor(Math.random() * 100),
                    startDate,
                    endDate,
                };
            });

                        // Fetch Google Data
                        const googleResponse = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
                        if (!googleResponse.ok) throw new Error('Failed to fetch Google Ads data');
                        const googleUsers: any[] = await googleResponse.json();
                        const googleCampaigns: Campaign[] = googleUsers.map((user: any) => {
                const budget = Math.floor(Math.random() * 15000) + 1000;
                const { startDate, endDate } = generateRandomDate(60, 90);
                return {
                    id: user.id.toString(),
                    name: `Google Ads Campaign ${user.username}`,
                    status: user.id % 2 === 0 ? 'active' : 'completed',
                    budget,
                    spent: Math.floor(Math.random() * Math.min(budget, 12000)),
                    impressions: Math.floor(Math.random() * 150000),
                    clicks: Math.floor(Math.random() * 7500),
                    conversions: Math.floor(Math.random() * 150),
                    startDate,
                    endDate,
                };
            });

                        const allCampaigns = [...facebookCampaigns, ...googleCampaigns];

                        // Calculate Metrics
                        const totalBudget = allCampaigns.reduce((sum, c) => sum + c.budget, 0);
                        const totalSpent = allCampaigns.reduce((sum, c) => sum + c.spent, 0);
                        const totalImpressions = allCampaigns.reduce((sum, c) => sum + c.impressions, 0);
                        const totalClicks = allCampaigns.reduce((sum, c) => sum + c.clicks, 0);
                        const totalConversions = allCampaigns.reduce((sum, c) => sum + c.conversions, 0);

                        const rawConversionRate = totalClicks > 0 ? totalConversions / totalClicks : 0;
                        const rawCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
                        const rawCpc = totalClicks > 0 ? totalSpent / totalClicks : 0;

                        const metrics: DashboardMetrics = {
                                totalBudget,
                                totalSpent,
                                totalImpressions,
                                totalClicks,
                                totalConversions,
                                conversionRate: formatPercentage(rawConversionRate),
                                ctr: formatPercentage(rawCtr),
                                cpc: formatCurrency(rawCpc),
                        };

            // Campaign Status Counting
            const overview: OverviewStats = {
                totalCampaigns: allCampaigns.length,
                activeCampaigns: allCampaigns.filter(c => c.status === 'active').length,
                pausedCampaigns: allCampaigns.filter(c => c.status === 'paused').length,
                completedCampaigns: allCampaigns.filter(c => c.status === 'completed').length,
            };

                        dashboardData = {
                                metrics,
                overview,
                                campaigns: {
                                        facebook: facebookCampaigns,
                                        google: googleCampaigns,
                                },
                        };
                } catch (e: any) {
                        console.error('Error loading dashboard data:', e);
                        error = e.message || 'An unknown error occurred.';
            dashboardData = null; // Clear data on error
                } finally {
                        loading = false;
                }
        }

        // Formatting Functions
        function formatNumber(value: number): string {
                return value.toLocaleString('en-US');
        }

        function formatCurrency(value: number): string {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }

        function formatPercentage(value: number): string {
        if (isNaN(value) || !isFinite(value)) return '0.00%';
                return (value * 100).toFixed(2) + '%';
        }

        // Event Handlers
        function handleRefresh() {
                if (!loading) {
                        loadDashboardData();
                }
        }

    function getStatusBadgeClass(status: Campaign['status']): string {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300 dark:hover:bg-green-700/50 border-green-500/50';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-700/30 dark:text-yellow-300 dark:hover:bg-yellow-700/50 border-yellow-500/50';
            case 'completed':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-700/30 dark:text-blue-300 dark:hover:bg-blue-700/50 border-blue-500/50';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-700/50 border-gray-500/50';
        }
    }

        // Theme Management
        function updateTheme() {
                if (isDarkMode) {
                        document.documentElement.classList.add('dark');
                } else {
                        document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        }

        function toggleTheme() {
                isDarkMode = !isDarkMode;
                updateTheme();
        }

        // Lifecycle
        onMount(() => {
                const storedTheme = localStorage.getItem('theme');
                if (storedTheme) {
                        isDarkMode = storedTheme === 'dark';
                } else {
                        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                updateTheme();
                loadDashboardData();
        });

</script>

<div class="dashboard min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <header class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
                <div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-6xl">
                        <h1 class="text-2xl font-semibold tracking-tight">Campaign Dashboard</h1>
                        <div class="flex items-center space-x-2">
                                <Button variant="outline" on:click={handleRefresh} disabled={loading} class="w-[150px]">
                                        {#if loading && !dashboardData} <!-- Show loading only on initial full load or refresh without data -->
                                                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                        {:else}
                                                <RefreshCw class="mr-2 h-4 w-4 {loading ? 'animate-spin' : ''}" />
                                                Refresh Data
                                        {/if}
                                </Button>
                                <Button variant="outline" size="icon" on:click={toggleTheme} aria-label="Toggle theme">
                                        {#if isDarkMode}
                                                <Sun class="h-[1.2rem] w-[1.2rem]" />
                                        {:else}
                                                <Moon class="h-[1.2rem] w-[1.2rem]" />
                                        {/if}
                                </Button>
                        </div>
                </div>
        </header>

        <main class="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-6xl w-full">
                {#if loading && !dashboardData}
                        <div class="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
                                <Loader2 class="h-12 w-12 animate-spin text-primary mb-4" />
                                <p class="text-lg text-muted-foreground">Loading dashboard data...</p>
                        </div>
                {:else if error}
                        <div class="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg flex flex-col items-center space-y-4">
                <AlertTriangle class="h-10 w-10" />
                                <h2 class="text-xl font-semibold">Oops! Something went wrong.</h2>
                                <p>{error}</p>
                                <Button variant="destructive" on:click={handleRefresh} disabled={loading}>
                    <RefreshCw class="mr-2 h-4 w-4 {loading ? 'animate-spin' : ''}" />
                                        Try Again
                                </Button>
                        </div>
                {:else if dashboardData}
                        <!-- Overview Cards Section -->
                        <section class="mb-6">
                                <h2 class="text-xl font-semibold mb-3">Overview</h2>
                                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium text-muted-foreground">Total Campaigns</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6">
                                                        <p class="text-3xl font-bold">{formatNumber(dashboardData.overview.totalCampaigns)}</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <Card.Title class="text-lg font-medium text-muted-foreground">Active Campaigns</Card.Title>
                            <Badge variant="outline" class="{getStatusBadgeClass('active')} text-xs">Active</Badge>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6 pt-0">
                                                        <p class="text-3xl font-bold">{formatNumber(dashboardData.overview.activeCampaigns)}</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <Card.Title class="text-lg font-medium text-muted-foreground">Paused Campaigns</Card.Title>
                            <Badge variant="outline" class="{getStatusBadgeClass('paused')} text-xs">Paused</Badge>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6 pt-0">
                                                        <p class="text-3xl font-bold">{formatNumber(dashboardData.overview.pausedCampaigns)}</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <Card.Title class="text-lg font-medium text-muted-foreground">Completed Campaigns</Card.Title>
                            <Badge variant="outline" class="{getStatusBadgeClass('completed')} text-xs">Completed</Badge>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6 pt-0">
                                                        <p class="text-3xl font-bold">{formatNumber(dashboardData.overview.completedCampaigns)}</p>
                                                </Card.Content>
                                        </Card.Root>
                                </div>
                        </section>

                        <!-- Metrics Cards Section -->
                        <section class="mb-6">
                <h2 class="text-xl font-semibold mb-3">Performance Metrics</h2>
                                <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Total Budget</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6">
                                                        <p class="text-3xl font-bold">{formatCurrency(dashboardData.metrics.totalBudget)}</p>
                            <p class="text-xs text-muted-foreground">Across all campaigns</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Total Spent</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6">
                                                        <p class="text-3xl font-bold">{formatCurrency(dashboardData.metrics.totalSpent)}</p>
                            <p class="text-xs text-muted-foreground">Across all campaigns</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Conversion Rate</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6">
                                                        <p class="text-3xl font-bold">{dashboardData.metrics.conversionRate}</p>
                            <p class="text-xs text-muted-foreground">(Conversions / Clicks)</p>
                                                </Card.Content>
                                        </Card.Root>
                    <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Click-Through Rate (CTR)</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-6 pb-6">
                                                        <p class="text-3xl font-bold">{dashboardData.metrics.ctr}</p>
                            <p class="text-xs text-muted-foreground">(Clicks / Impressions)</p>
                                                </Card.Content>
                                        </Card.Root>
                                </div>
                        </section>

                        <!-- Campaign Tables Section -->
                        <section>
                <h2 class="text-xl font-semibold mb-3">Campaign Details</h2>
                                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <!-- Facebook Campaigns Table -->
                                        <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Facebook Campaigns</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-0 sm:px-6 pb-6">
                            <div class="overflow-x-auto">
                                <table class="w-full min-w-[600px] sm:min-w-full">
                                    <thead>
                                        <tr class="border-b">
                                            <th class="p-4 text-left font-medium text-muted-foreground">Name</th>
                                            <th class="p-4 text-left font-medium text-muted-foreground">Status</th>
                                            <th class="p-4 text-right font-medium text-muted-foreground">Budget</th>
                                            <th class="p-4 text-right font-medium text-muted-foreground">Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each dashboardData.campaigns.facebook as campaign (campaign.id)}
                                            <tr class="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                                                <td class="p-4 text-left font-medium">{campaign.name}</td>
                                                <td class="p-4 text-left">
                                                    <Badge variant="outline" class="{getStatusBadgeClass(campaign.status)} capitalize text-xs py-0.5 px-2">{campaign.status}</Badge>
                                                </td>
                                                <td class="p-4 text-right">{formatCurrency(campaign.budget)}</td>
                                                <td class="p-4 text-right">{formatCurrency(campaign.spent)}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                                                </Card.Content>
                                        </Card.Root>

                                        <!-- Google Ads Table Card -->
                                        <Card.Root>
                                                <Card.Header class="p-6">
                                                        <Card.Title class="text-lg font-medium">Google Ads Campaigns</Card.Title>
                                                </Card.Header>
                                                <Card.Content class="px-0 sm:px-6 pb-6">
                            <div class="overflow-x-auto">
                                <table class="w-full min-w-[600px] sm:min-w-full">
                                    <thead>
                                        <tr class="border-b">
                                            <th class="p-4 text-left font-medium text-muted-foreground">Name</th>
                                            <th class="p-4 text-left font-medium text-muted-foreground">Status</th>
                                            <th class="p-4 text-right font-medium text-muted-foreground">Budget</th>
                                            <th class="p-4 text-right font-medium text-muted-foreground">Spent</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each dashboardData.campaigns.google as campaign (campaign.id)}
                                            <tr class="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                                                <td class="p-4 text-left font-medium">{campaign.name}</td>
                                                <td class="p-4 text-left">
                                                    <Badge variant="outline" class="{getStatusBadgeClass(campaign.status)} capitalize text-xs py-0.5 px-2">{campaign.status}</Badge>
                                                </td>
                                                <td class="p-4 text-right">{formatCurrency(campaign.budget)}</td>
                                                <td class="p-4 text-right">{formatCurrency(campaign.spent)}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                                                </Card.Content>
                                        </Card.Root>
                                </div>
                        </section>
                {/if}
        </main>
    <footer class="text-center p-4 border-t border-border text-sm text-muted-foreground">
        Campaign Analytics Dashboard &copy; {new Date().getFullYear()}
    </footer>
</div>

<style>
        /* Specific Card Padding as per prompt if needed, though shadcn defaults are p-6 */
    /*
        :global(.card-header-custom) { @apply p-6; }
        :global(.card-content-custom) { @apply px-6 pb-6 pt-0; } 
    If Card.Header has pb-2, Card.Content should not have pt-0 but use default (p-6, so pt-6) unless it's for specific cards.
    I've adjusted card padding/spacing in the HTML directly.
    Example: Card.Header pb-2, Card.Content pt-0 for some overview cards.
    For metrics cards and tables, using default p-6 for header, and px-6 pb-6 for content.
    For table cards, px-0 on Card.Content for small screens to allow table scrollbar full width.
    */

    /* Typography Scales from prompt */
    /* h1 in header is text-2xl font-semibold (prompt: large title 1.5rem / 24px) */
    /* Card.Title is text-lg font-medium (prompt: card titles 1.125rem / 18px) */
    /* Metric values (e.g., total campaigns number) are text-3xl font-bold (prompt: 1.5rem / 24px - I made it larger for impact) */
    /* Subtitles (e.g., 'Across all campaigns') are text-xs text-muted-foreground (prompt: 0.875rem / 14px) */
    /* Table text will use default Tailwind body size (1rem) and font-medium where specified. */
</style>