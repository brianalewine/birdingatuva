import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { DecorativeBirds } from "@/components/decorative-birds"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Mail, Instagram, Facebook, Clock, ExternalLink, Compass } from "lucide-react"

export default function HomePage() {
  const trips = [
    {
      name: "Ivy Creek Natural Area",
      description: "Varied habitats perfect for spotting warblers, woodpeckers, and waterfowl throughout the seasons.",
      frequency: "Monthly",
      location: "215-acre preserve",
      image: "/placeholder.svg?height=300&width=500",
      allTrailsUrl: "https://www.alltrails.com/trail/us/virginia/ivy-creek-natural-area-loop",
      difficulty: "Easy",
      distance: "2.5 mi",
    },
    {
      name: "Shenandoah National Park",
      description: "Experience thrushes, vireos, and raptors soaring over the Blue Ridge Mountains.",
      frequency: "Seasonal",
      location: "High-elevation birding",
      image: "/placeholder.svg?height=300&width=500",
      allTrailsUrl: "https://www.alltrails.com/parks/us/virginia/shenandoah-national-park",
      difficulty: "Moderate",
      distance: "Various",
    },
    {
      name: "Rivanna River Trail",
      description: "Walk along the river to spot herons, kingfishers, and a variety of songbirds.",
      frequency: "Weekly",
      location: "River corridor",
      image: "/placeholder.svg?height=300&width=500",
      allTrailsUrl: "https://www.alltrails.com/trail/us/virginia/rivanna-trail",
      difficulty: "Easy",
      distance: "20 mi",
    },
    {
      name: "UVA Grounds & Observatory Hill",
      description: "Beginner-friendly outings to observe migrants right on campus. Perfect for busy students!",
      frequency: "Bi-weekly",
      location: "Campus birding",
      image: "/placeholder.svg?height=300&width=500",
      allTrailsUrl: "https://www.alltrails.com/trail/us/virginia/observatory-hill-loop",
      difficulty: "Easy",
      distance: "1.2 mi",
    },
  ]

  return (
    <div className="min-h-screen relative">
      <DecorativeBirds />
      <Navigation />

      <main className="relative z-10">
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-100"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "0s",
              }}
            >
              <Image
                src="/images/hero-backgrounds/hero-1.jpg"
                alt=""
                fill
                className="object-cover"
                priority
                quality={95}
              />
            </div>
            <div
              className="absolute inset-0 opacity-0"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "10s",
              }}
            >
              <Image src="/images/hero-backgrounds/hero-2.jpg" alt="" fill className="object-cover" quality={95} />
            </div>
            <div
              className="absolute inset-0 opacity-0"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "20s",
              }}
            >
              <Image src="/images/hero-backgrounds/hero-3.jpg" alt="" fill className="object-cover" quality={95} />
            </div>
            <div
              className="absolute inset-0 opacity-0"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "30s",
              }}
            >
              <Image src="/images/hero-backgrounds/hero-4.jpg" alt="" fill className="object-cover" quality={95} />
            </div>
            <div
              className="absolute inset-0 opacity-0"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "40s",
              }}
            >
              <Image src="/images/hero-backgrounds/hero-5.jpg" alt="" fill className="object-cover" quality={95} />
            </div>
            <div
              className="absolute inset-0 opacity-0"
              style={{
                animation: "crossfade 60s infinite",
                animationDelay: "50s",
              }}
            >
              <Image src="/images/hero-backgrounds/hero-6.jpg" alt="" fill className="object-cover" quality={95} />
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/75" />

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in-up">
            <div className="mb-8 flex justify-center">
              <div className="relative w-40 h-40 md:w-48 md:h-48 drop-shadow-2xl">
                <Image
                  src="/images/new-logo.png"
                  alt="UVA Bird Club Logo"
                  fill
                  className="object-contain filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  priority
                />
              </div>
            </div>

            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tight [text-shadow:_0_4px_20px_rgb(0_0_0_/_90%),_0_2px_8px_rgb(0_0_0_/_80%)]">
              HOO'S WATCHING HOOS
            </h1>
            <p className="text-2xl md:text-3xl text-white mb-4 font-light tracking-wide [text-shadow:_0_3px_12px_rgb(0_0_0_/_80%),_0_1px_4px_rgb(0_0_0_/_70%)]">
              Birding Club @ UVA
            </p>
            <p className="text-lg md:text-xl text-white/95 mb-12 max-w-2xl mx-auto leading-relaxed [text-shadow:_0_3px_12px_rgb(0_0_0_/_80%),_0_1px_4px_rgb(0_0_0_/_70%)]">
              Join us in exploring the diverse birdlife of Central Virginia through education, conservation, and
              community
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform"
                asChild
              >
                <Link href="#join">Join the Club</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 text-white border-2 border-white hover:bg-white hover:text-primary text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform backdrop-blur-sm"
                asChild
              >
                <Link href="#trips">Explore Trips</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/creek.png" alt="Wildlife at creek" fill className="object-cover" />
              </div>

              <div>
                <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-primary">ABOUT US</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We are dedicated to fostering appreciation for birds and their habitats through education,
                  conservation, and community engagement.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <p className="text-foreground">Promoting bird conservation and environmental stewardship</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <p className="text-foreground">Providing birding education and field experience opportunities</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <p className="text-foreground">Building a community of bird enthusiasts</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    <p className="text-foreground">Organizing birding trips and educational events</p>
                  </div>
                </div>

                <p className="mt-6 text-lg font-semibold text-accent">
                  All experience levels welcome—from beginners to experienced birders!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <Image src="/images/ebird-logo.png" alt="eBird Logo" width={200} height={80} className="object-contain" />
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-6 text-primary">OUR eBIRD ACCOUNT</h2>
            <Card className="shadow-xl">
              <CardContent className="pt-6">
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Track our sightings and see what the club has spotted! We use eBird to document our observations and
                  contribute to citizen science.
                </p>
                <Button size="lg" asChild>
                  <a href="https://ebird.org" target="_blank" rel="noopener noreferrer">
                    Visit Our eBird Profile
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="trips" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-5xl md:text-6xl font-bold mb-4 text-primary">LOCAL BIRDING TRIPS</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore the diverse birdlife in and around Charlottesville with our regular outings
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {trips.map((trip) => (
                <Card
                  key={trip.name}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={trip.image || "/placeholder.svg"}
                      alt={trip.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">{trip.frequency}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">{trip.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {trip.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{trip.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Compass className="w-4 h-4" />
                        <span>{trip.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.distance}</span>
                      </div>
                    </div>

                    <Button className="w-full group/btn bg-transparent" variant="outline" asChild>
                      <a href={trip.allTrailsUrl} target="_blank" rel="noopener noreferrer">
                        View Trail on AllTrails
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="py-20 px-4 bg-gradient-to-b from-muted to-background">
          <div className="container mx-auto max-w-6xl">
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-4 text-center text-primary">HOW TO JOIN</h2>
            <p className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
              Getting started is easy! Follow these three simple steps to become part of our birding community.
            </p>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent to-accent opacity-20" />

              <div className="grid lg:grid-cols-3 gap-8 mb-12 relative">
                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent">
                  <CardHeader>
                    <div className="relative mx-auto mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 text-white flex items-center justify-center text-4xl font-bold mx-auto shadow-lg">
                        1
                      </div>
                      <div className="absolute -inset-2 rounded-full bg-accent/20 -z-10 animate-pulse" />
                    </div>
                    <CardTitle className="font-display text-3xl">JOIN GROUPME</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Connect with fellow birders and stay updated on all club activities, trip announcements, and bird
                      sightings.
                    </p>
                    <Button variant="default" size="lg" className="w-full" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Join GroupMe
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent">
                  <CardHeader>
                    <div className="relative mx-auto mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 text-white flex items-center justify-center text-4xl font-bold mx-auto shadow-lg">
                        2
                      </div>
                      <div
                        className="absolute -inset-2 rounded-full bg-accent/20 -z-10 animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                    <CardTitle className="font-display text-3xl">FOLLOW US</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      See stunning photos from our trips, learn about upcoming events, and join our online community.
                    </p>
                    <Button variant="default" size="lg" className="w-full" asChild>
                      <a href="https://instagram.com/uvabirdclub" target="_blank" rel="noopener noreferrer">
                        @uvabirdclub
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-accent">
                  <CardHeader>
                    <div className="relative mx-auto mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/70 text-white flex items-center justify-center text-4xl font-bold mx-auto shadow-lg">
                        3
                      </div>
                      <div
                        className="absolute -inset-2 rounded-full bg-accent/20 -z-10 animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                    <CardTitle className="font-display text-3xl">GO BIRDING!</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Participate in trips, contribute to citizen science projects, and discover the joy of birding.
                    </p>
                    <Button variant="secondary" size="lg" className="w-full" disabled>
                      See You Out There!
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 shadow-xl">
              <CardHeader>
                <CardTitle className="font-display text-4xl text-center">CLUB ACTIVITIES & DUES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-display text-xl mb-4 text-accent">What We Offer</h3>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <p>Biweekly education seminars on bird ID and sustainable practices</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <p>Trip announcements at meetings with food provided</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <p>Local trips in the Charlottesville area</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-display text-xl mb-4 text-accent">Membership</h3>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">💵</div>
                      <div>
                        <p className="font-bold text-2xl text-accent">$7 per semester</p>
                        <p className="text-sm text-muted-foreground">Covers local trips and club activities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">🚗</div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Additional fees may apply for longer-distance trips to cover transportation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-5xl md:text-6xl font-bold mb-12 text-center text-primary">GET IN TOUCH</h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Mail className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <CardTitle className="font-display text-xl">EMAIL</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href="mailto:uvabirdclub@virginia.edu" className="text-accent hover:underline break-all">
                    uvabirdclub@virginia.edu
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="flex justify-center gap-3 mb-4">
                    <Instagram className="w-12 h-12 text-accent" />
                    <Facebook className="w-12 h-12 text-accent" />
                  </div>
                  <CardTitle className="font-display text-xl">SOCIAL MEDIA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a
                    href="https://instagram.com/uvabirdclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-accent hover:underline"
                  >
                    @uvabirdclub
                  </a>
                  <a
                    href="https://facebook.com/uvabirdclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-accent hover:underline"
                  >
                    UVA Bird Club
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Clock className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <CardTitle className="font-display text-xl">MEETINGS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    SAB Room 204
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Third Thursday
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    7:00 PM
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
