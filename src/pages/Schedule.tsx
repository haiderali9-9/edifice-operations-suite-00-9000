
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Schedule = () => {
  const { toast } = useToast();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const [currentWeek, setCurrentWeek] = React.useState(getWeekDates(currentDate));

  function getWeekDates(date: Date) {
    const week = [];
    const day = date.getDay(); // Get day of week (0-6)
    const diff = date.getDate() - day; // Adjust to get Sunday
    
    // Generate dates for the week
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      week.push(newDate);
    }
    
    return week;
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const firstDay = new Date(currentWeek[0]);
    const daysToAdd = direction === 'next' ? 7 : -7;
    firstDay.setDate(firstDay.getDate() + daysToAdd);
    setCurrentWeek(getWeekDates(firstDay));
  };

  // Mock schedule data
  const scheduleItems = [
    {
      id: 1,
      title: "Team Meeting",
      project: "Skyline Tower",
      type: "meeting",
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 30),
    },
    {
      id: 2,
      title: "Site Inspection",
      project: "Oceanview Residences",
      type: "field",
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 13, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 15, 0),
    },
    {
      id: 3,
      title: "Concrete Pouring",
      project: "Central Business Hub",
      type: "construction",
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 8, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 16, 0),
    },
    {
      id: 4,
      title: "Client Review",
      project: "Skyline Tower",
      type: "meeting",
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 14, 0),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 15, 30),
    }
  ];

  const getScheduleItemsForDate = (date: Date) => {
    return scheduleItems.filter(item => {
      const itemDate = new Date(item.start);
      return itemDate.getDate() === date.getDate() && 
             itemDate.getMonth() === date.getMonth() && 
             itemDate.getFullYear() === date.getFullYear();
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getItemClass = (type: string) => {
    switch(type) {
      case 'meeting':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'field':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'construction':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <PageLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-gray-500 mt-1">
            Manage your project timelines and events
          </p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => navigateWeek('prev')}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous Week
          </Button>
          <Button variant="outline" onClick={() => navigateWeek('next')}>
            Next Week <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          <Button className="bg-construction-700 hover:bg-construction-800" onClick={() => {
            toast({
              title: "Feature Coming Soon",
              description: "New event functionality will be implemented soon.",
            });
          }}>
            <Plus className="h-4 w-4 mr-2" /> New Event
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Weekly Schedule <span className="text-gray-500 text-sm ml-2">{`${currentMonth} ${currentYear}`}</span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {daysOfWeek.map((day, index) => (
              <div key={day} className="text-center p-2 font-medium">
                <div className="mb-1">{day}</div>
                <div className={`text-sm inline-flex items-center justify-center w-7 h-7 rounded-full ${isToday(currentWeek[index]) ? 'bg-construction-600 text-white' : 'text-gray-500'}`}>
                  {currentWeek[index].getDate()}
                </div>
              </div>
            ))}
            
            {/* Schedule Items for each day */}
            {currentWeek.map((date, dateIndex) => (
              <div key={dateIndex} className="min-h-[300px] border rounded-md p-2">
                {getScheduleItemsForDate(date).map(item => (
                  <div 
                    key={item.id} 
                    className={`mb-2 p-2 border rounded ${getItemClass(item.type)} cursor-pointer transition-all hover:shadow`}
                    onClick={() => {
                      toast({
                        title: item.title,
                        description: `${item.project} - ${formatTime(item.start)} to ${formatTime(item.end)}`,
                      });
                    }}
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs">{item.project}</div>
                    <div className="text-xs mt-1">{formatTime(item.start)} - {formatTime(item.end)}</div>
                  </div>
                ))}
                {getScheduleItemsForDate(date).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full opacity-50">
                    <CalendarClock className="h-6 w-6 mb-1 text-gray-400" />
                    <span className="text-xs text-gray-400">No events</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Upcoming deadlines will be displayed here.
              <br />
              This feature will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              Resource allocation calendar will be displayed here.
              <br />
              This feature will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Schedule;
