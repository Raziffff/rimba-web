"use client";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, MapPin } from "lucide-react";

type AgendaItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string | null;
  category: string | null;
};

type AgendaCalendarProps = {
  agendas: AgendaItem[];
};

function toDayKey(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export default function AgendaCalendar({ agendas }: AgendaCalendarProps) {
  const [value, setValue] = useState<Date>(new Date());

  const grouped = useMemo(() => {
    const map = new Map<string, AgendaItem[]>();
    for (const agenda of agendas) {
      const day = toDayKey(new Date(agenda.date));
      const prev = map.get(day) ?? [];
      prev.push(agenda);
      map.set(day, prev);
    }
    return map;
  }, [agendas]);

  const selectedKey = toDayKey(value);
  const selectedItems = grouped.get(selectedKey) ?? [];

  return (
    <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
      <div className="agenda-calendar">
        <Calendar
          onChange={(next) => setValue(next as Date)}
          value={value}
          className="w-full rounded-2xl border border-slate-200 p-4"
          tileContent={({ date, view }) => {
            if (view !== "month") return null;
            const hasAgenda = grouped.has(toDayKey(date));
            if (!hasAgenda) return null;
            return <div className="mt-1 flex justify-center"><span className="h-1.5 w-1.5 rounded-full bg-green-700" /></div>;
          }}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <CalendarDays size={18} className="text-green-700" />
          {format(value, "dd MMMM yyyy", { locale: id })}
        </div>

        <div className="mt-4 space-y-3">
          {selectedItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Tidak ada agenda pada tanggal ini.
            </div>
          ) : (
            selectedItems.map((agenda) => (
              <Link
                key={agenda.id}
                href={`/public/agenda/${agenda.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-green-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {agenda.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {agenda.description}
                    </p>
                    {agenda.location && (
                      <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={14} />
                        {agenda.location}
                      </p>
                    )}
                  </div>
                  {agenda.category && (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {agenda.category}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

