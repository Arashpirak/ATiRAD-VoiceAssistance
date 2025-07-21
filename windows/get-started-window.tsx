import { Button } from "@/components/ui/button"

interface GetStartedWindowProps {
  onContinue?: () => void
}

export function GetStartedWindow({ onContinue }: GetStartedWindowProps) {
  return (
    <div className="text-center p-8">
      <h2 className="text-3xl font-bold text-[#08075C] mb-6">Ready to Get Started?</h2>
      <div className="space-y-6 max-w-2xl mx-auto">
        <p className="text-lg text-gray-700">
          Join thousands of businesses already using our AI voice assistant to improve customer experience.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-[#01ADEF] hover:bg-[#0194D1] text-white px-8 py-3">Start Free Trial</Button>
          <Button
            variant="outline"
            className="border-[#01ADEF] text-[#01ADEF] hover:bg-[#01ADEF] hover:text-white px-8 py-3 bg-transparent"
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  )
}
