"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DecorativeBirds } from "@/components/decorative-birds"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const faqCategories = [
  {
    category: "Getting Started",
    faqs: [
      {
        question: "Do I need birding knowledge to join?",
        answer:
          "Not at all! We welcome birders of all experience levels, from complete beginners to seasoned experts. Our meetings and trips are designed to be educational and inclusive.",
      },
      {
        question: "How much does membership cost?",
        answer:
          "Membership dues are $7 per semester, which covers local trips around Charlottesville. Longer-distance trips may have additional fees to cover transportation and other costs.",
      },
      {
        question: "What should I bring on bird walks?",
        answer:
          "Bring binoculars if you have them (we have extras to lend), comfortable walking shoes, weather-appropriate clothing, water, and a notebook or phone for recording observations. A field guide is helpful but not required.",
      },
    ],
  },
  {
    category: "Meetings & Activities",
    faqs: [
      {
        question: "When and where do you meet?",
        answer:
          "We meet on the third Thursday of each month at 7:00 PM in the Student Activities Building, Room 204. Check our GroupMe or Instagram for any schedule changes.",
      },
      {
        question: "Can I participate without attending meetings?",
        answer:
          "While we encourage meeting attendance for the full experience, you can still join our trips and stay connected through GroupMe. Meetings are where we announce upcoming trips and provide educational content.",
      },
      {
        question: "What educational workshops do you offer?",
        answer:
          "Our biweekly seminars cover topics like bird identification, bird calls and songs, migration patterns, conservation issues, ethical birding practices, and photography tips.",
      },
    ],
  },
  {
    category: "Birding & Trips",
    faqs: [
      {
        question: "What bird species can I expect to see in the Charlottesville area?",
        answer:
          "The Charlottesville area is home to over 200 bird species throughout the year! Common sightings include cardinals, blue jays, woodpeckers, warblers, herons, and various raptors. Seasonal migrations bring even more diversity.",
      },
      {
        question: "Do you organize overnight or extended trips?",
        answer:
          "Yes! In addition to our regular local outings, we organize seasonal trips to places like Shenandoah National Park and other birding hotspots. These trips are announced at meetings and through our communication channels.",
      },
      {
        question: "What time do morning bird walks typically start?",
        answer:
          "Morning walks usually start around 7:00-8:00 AM, as this is when birds are most active. Specific times are announced for each trip based on the season and location.",
      },
      {
        question: "Is transportation provided for field trips?",
        answer:
          "For local trips, we typically meet at the location. For longer trips, we coordinate carpools among members. Transportation details are shared when trips are announced.",
      },
      {
        question: "What are the best seasons for birding in Virginia?",
        answer:
          "Every season offers unique birding opportunities! Spring and fall migrations (April-May and September-October) are particularly exciting, but winter and summer also have their own special species to observe.",
      },
    ],
  },
  {
    category: "Community & Participation",
    faqs: [
      {
        question: "Can non-students participate?",
        answer:
          "Our club is primarily for UVA students, but we occasionally welcome guests and community members on specific trips. Contact us for more information about guest participation.",
      },
      {
        question: "What citizen science projects do you participate in?",
        answer:
          "We actively contribute to eBird, recording all our observations to help scientists track bird populations and migrations. We also participate in events like the Christmas Bird Count and Global Big Day.",
      },
      {
        question: "Can I suggest new birding locations?",
        answer:
          "We love discovering new birding spots! Share your suggestions at meetings or through GroupMe, and we'll work to incorporate them into our schedule.",
      },
      {
        question: "How do I stay updated on club activities?",
        answer:
          "Join our GroupMe for real-time updates, follow us on Instagram (@uvabirdclub) and Facebook (UVA Bird Club), and attend our monthly meetings. You can also email us at uvabirdclub@virginia.edu.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const toggleAccordion = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  const scrollToCategory = (category: string) => {
    setActiveCategory(category)
    const element = document.getElementById(category)
    element?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Filter FAQs based on search query
  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      faqs: cat.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.faqs.length > 0)

  return (
    <div className="min-h-screen relative">
      <Navigation />

  <main className="relative z-20">
        <DecorativeBirds />
        <PageHeader 
          title="FAQ"
          description="Everything you need to know about the UVA Bird Club"
        />

        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl relative z-20">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sticky Table of Contents Sidebar */}
              <aside className="lg:col-span-1">
                <div className="lg:sticky lg:top-24 space-y-6">
                  <div>
                    <h3 className="font-display text-xl mb-4 text-primary">QUICK NAVIGATION</h3>
                    <nav className="space-y-2">
                      {faqCategories.map((cat) => (
                        <button
                          key={cat.category}
                          onClick={() => scrollToCategory(cat.category)}
                          className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                            activeCategory === cat.category
                              ? "bg-accent text-accent-foreground font-semibold"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {cat.category}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Search Functionality */}
                  <div>
                    <h3 className="font-display text-xl mb-4 text-primary">SEARCH</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Collapsible Accordion with Categories */}
              <div className="lg:col-span-3 space-y-8">
                {filteredCategories.map((category, catIndex) => (
                  <div key={category.category} id={category.category} className="scroll-mt-24">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 text-primary">
                      {category.category.toUpperCase()}
                    </h2>
                    <div className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => {
                        const key = `${catIndex}-${faqIndex}`
                        const isOpen = openIndex === key

                        return (
                          <Card
                            key={faqIndex}
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50"
                          >
                            <button
                              onClick={() => toggleAccordion(catIndex, faqIndex)}
                              className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                            >
                              <h3 className="font-semibold text-lg text-foreground pr-4">{faq.question}</h3>
                              <ChevronDown
                                className={`w-5 h-5 text-accent flex-shrink-0 transition-transform duration-300 ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isOpen ? "max-h-96" : "max-h-0"
                              }`}
                            >
                              <CardContent className="pt-0 pb-6 px-6">
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                              </CardContent>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {filteredCategories.length === 0 && (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground text-lg">
                      No FAQs found matching "{searchQuery}". Try a different search term.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-muted">
          <div className="container mx-auto max-w-3xl relative z-20">
            <Card className="text-center shadow-xl">
              <CardHeader>
                <CardTitle className="font-display text-4xl md:text-5xl mb-4">STILL HAVE QUESTIONS?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 text-lg">
                  We're here to help! Reach out to us and we'll get back to you as soon as possible.
                </p>
                <Button size="lg" asChild>
                  <Link href="/#contact">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
