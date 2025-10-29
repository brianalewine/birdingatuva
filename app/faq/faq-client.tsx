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
          "Not at all! We welcome birders of all experience levels, from complete beginners to seasoned experts. Our trips and meetings are designed to be inclusive and educational for everyone.",
      },
      {
        question: "How do I join the club?",
        answer:
          "Simply attend one of our meetings or trips! Semester dues are $10, which you can pay with cash or Venmo at or before your first trip. Follow us on Instagram or join our GroupMe (links on the home page) for event announcements and trip details.",
      },
      {
        question: "Do I need binoculars?",
        answer:
          "While having your own binoculars is helpful, we have a few pairs available to borrow during trips for beginners who are just getting started. Even without binoculars, you can bird using the Merlin Bird ID app, which has photo and audio recognition features to help identify birds!",
      },
      {
        question: "What should I bring on a birding trip?",
        answer:
          "Bring binoculars (if you have them), a field guide (optional, we'll help with ID), water, comfortable walking shoes, and weather-appropriate clothing. We highly recommend downloading the Merlin Bird ID app and eBird app - both have great record-keeping features where you can track what birds you see!",
      },
      {
        question: "Do I have to pay before I go on a trip?",
        answer:
          "No need to pay in advance! You can pay your semester dues with cash or Venmo when you go on your first trip, or any time before. We make it easy and flexible for new members to get started.",
      },
    ],
  },
  {
    category: "Meetings & Events",
    faqs: [
      {
        question: "When and where do you meet?",
        answer:
          "We hold regular meetings during the academic year, typically bi-weekly. Meeting times and locations are announced on our Instagram @uva_birdclub. Most meetings are held on Grounds in convenient locations for students.",
      },
      {
        question: "What happens at meetings?",
        answer:
          "Our meetings include trip planning, bird identification workshops, guest speakers from local birding organizations, and social time to connect with fellow bird enthusiasts. We also discuss conservation efforts and citizen science projects.",
      },
      {
        question: "How often do you go on birding trips?",
        answer:
          "We organize birding trips weekly to bi-weekly, depending on the season and interest. Trips range from short walks on Grounds to longer excursions to places like Ivy Creek and Shenandoah National Park.",
      },
      {
        question: "Can I suggest a birding location?",
        answer:
          "Absolutely! We love discovering new birding spots. Share your suggestions at any meeting or reach out to our leadership team. If you know a great location, we'd love to plan a trip there!",
      },
    ],
  },
  {
    category: "Birding Trips",
    faqs: [
      {
        question: "How long are typical trips?",
        answer:
          "Most local trips last 2-3 hours, perfect for fitting into a student schedule. Longer trips to Shenandoah or other destinations might be half-day or full-day excursions on weekends.",
      },
      {
        question: "Do I need a car to participate?",
        answer:
          "Not necessarily! Many of our trips are to locations accessible by walking or biking from Grounds, like Observatory Hill and the Rivanna Trail. For farther locations, we coordinate carpools so everyone can participate.",
      },
      {
        question: "What's the best time of year for birding?",
        answer:
          "Every season offers unique birding opportunities! Spring and fall migration (April-May and September-October) are especially exciting for seeing warblers and other migrants. Winter is great for waterfowl, and summer brings breeding songbirds.",
      },
      {
        question: "What if I can't identify birds?",
        answer:
          "That's what we're here for! Our experienced members love helping with bird identification. We use field marks, calls, and behavior to identify species together. It's all part of the learning experience!",
      },
      {
        question: "Will I get back in time for classes?",
        answer:
          "Yes! Local morning trips are scheduled so that most students can return to Grounds in time for their classes. If there's interest, we can also organize alternative trips at non-morning times to accommodate different schedules.",
      },
    ],
  },
  {
    category: "About the Club",
    faqs: [
      {
        question: "Is there a membership fee?",
        answer:
          "No! The UVA Bird Club is completely free to join and participate in. We're funded through UVA student activities and occasionally through small grants for special events.",
      },
      {
        question: "Can graduate students join?",
        answer:
          "Yes! We welcome all UVA students - undergraduates, graduate students, and even faculty or staff who are interested in birding. The more the merrier!",
      },
      {
        question: "Do you participate in citizen science?",
        answer:
          "Yes! We regularly contribute to projects like eBird, the Great Backyard Bird Count, and Christmas Bird Counts. These efforts help scientists track bird populations and migration patterns.",
      },
      {
        question: "How can I get more involved?",
        answer:
          "Beyond attending trips and meetings, you can help lead trips, give presentations, assist with social media, or run for a leadership position. We hold elections each spring. Contact our leadership team to learn more!",
      },
    ],
  },
]

interface FAQClientProps {
  birdImages: string[]
}

export function FAQClient({ birdImages }: FAQClientProps) {
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
        <DecorativeBirds images={birdImages} />
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
                          className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            activeCategory === cat.category
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {cat.category}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="hidden lg:block">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Still Have Questions?</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Can't find what you're looking for? Reach out to us!
                        </p>
                        <Button asChild className="w-full">
                          <Link href="mailto:contact@uvabirdclub.org">Contact Us</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </aside>

              {/* Main FAQ Content */}
              <div className="lg:col-span-3 space-y-8">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-800 shadow-sm"
                  />
                </div>

                {filteredCategories.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground">
                        No results found for "{searchQuery}". Try a different search term or{" "}
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-primary hover:underline"
                        >
                          clear your search
                        </button>
                        .
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCategories.map((category, catIndex) => (
                    <div key={category.category} id={category.category}>
                      <h2 className="font-display text-3xl mb-6 text-primary">
                        {category.category}
                      </h2>
                      <div className="space-y-4">
                        {category.faqs.map((faq, faqIndex) => {
                          const isOpen = openIndex === `${catIndex}-${faqIndex}`
                          return (
                            <Card key={faqIndex} className="overflow-hidden">
                              <button
                                onClick={() => toggleAccordion(catIndex, faqIndex)}
                                className="w-full text-left p-6 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                              >
                                <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                                <ChevronDown
                                  className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${
                                    isOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                              {isOpen && (
                                <div className="px-6 pb-6 pt-0">
                                  <p className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              )}
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}

                {/* Mobile Contact Card */}
                <div className="lg:hidden">
                  <Card>
                    <CardHeader>
                      <CardTitle>Still Have Questions?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Can't find what you're looking for? Reach out to us!
                      </p>
                      <Button asChild className="w-full">
                        <Link href="mailto:contact@uvabirdclub.org">Contact Us</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
