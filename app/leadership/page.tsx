"use client"

import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DecorativeBirds } from "@/components/decorative-birds"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import { useState } from "react"

const executives = [
	{
		position: "President",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "president@uvabirdclub.virginia.edu",
		bio: "Leading the club with passion for conservation and community building. Favorite bird: Peregrine Falcon.",
		image: "/placeholder.svg?height=400&width=400",
	},
	{
		position: "Vice President",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "vp@uvabirdclub.virginia.edu",
		bio: "Supporting club operations and coordinating with university partners. Favorite bird: Ruby-throated Hummingbird.",
		image: "/placeholder.svg?height=400&width=400",
	},
	{
		position: "Treasurer",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "treasurer@uvabirdclub.virginia.edu",
		bio: "Managing club finances and ensuring sustainable operations. Favorite bird: American Goldfinch.",
		image: "/placeholder.svg?height=400&width=400",
	},
	{
		position: "Secretary",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "secretary@uvabirdclub.virginia.edu",
		bio: "Keeping detailed records and managing communications. Favorite bird: Great Blue Heron.",
		image: "/placeholder.svg?height=400&width=400",
	},
	{
		position: "Events Coordinator",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "events@uvabirdclub.virginia.edu",
		bio: "Planning exciting birding trips and educational workshops. Favorite bird: Cedar Waxwing.",
		image: "/placeholder.svg?height=400&width=400",
	},
	{
		position: "Outreach Director",
		name: "[Name]",
		major: "[Major]",
		year: "Class of [Year]",
		email: "outreach@uvabirdclub.virginia.edu",
		bio: "Connecting with the community and promoting bird conservation. Favorite bird: Baltimore Oriole.",
		image: "/placeholder.svg?height=400&width=400",
	},
]

export default function LeadershipPage() {
	const [showNotification, setShowNotification] = useState(false)

	const copyEmail = () => {
		navigator.clipboard.writeText("rpt2fx@virginia.edu")
		setShowNotification(true)
		setTimeout(() => setShowNotification(false), 2000)
	}

	return (
		<div className="min-h-screen relative">
			<DecorativeBirds />
			<Navigation />

      <main className="relative z-10">
        <PageHeader 
          title="OUR LEADERSHIP"
          description="Meet the dedicated students leading the UVA Bird Club"
        />

				<section className="py-20 px-4">
					<div className="container mx-auto max-w-6xl">
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
							{executives.map((exec, index) => (
								<Card
									key={index}
									className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border-2 hover:border-accent/50"
								>
									<div className="relative h-72 overflow-hidden">
										<Image
											src={exec.image || "/placeholder.svg"}
											alt={exec.position}
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-500"
										/>
										<div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
											{exec.position}
										</div>
									</div>
									<CardHeader className="space-y-2">
										<CardTitle className="font-display text-2xl">
											{exec.name}
										</CardTitle>
										<CardDescription className="text-base">
											{exec.major} • {exec.year}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-muted-foreground text-sm leading-relaxed">
											{exec.bio}
										</p>
										<Button
											variant="outline"
											size="sm"
											className="w-full group/btn bg-transparent"
											asChild
										>
											<a
												href={`mailto:${exec.email}`}
												className="flex items-center justify-center gap-2"
											>
												<Mail className="w-4 h-4" />
												<span className="text-xs truncate">
													{exec.email}
												</span>
											</a>
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section className="py-20 px-4 bg-gradient-to-b from-muted to-background">
					<div className="container mx-auto max-w-3xl">
						<Card className="text-center shadow-xl border-2 border-accent/20">
							<CardHeader>
								<CardTitle className="font-display text-4xl md:text-5xl mb-4">
									JOIN OUR TEAM?
								</CardTitle>
								<CardDescription className="text-base leading-relaxed">
									Elections happen each spring, and all members are welcome to
									run for positions. We're always looking for passionate birders
									to help lead the club!
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="relative inline-block">
									<Button
										size="lg"
										onClick={copyEmail}
										className="px-8"
									>
										Contact Us About Leadership
									</Button>
									{showNotification && (
										<div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
											Email copied to clipboard!
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	)
}
