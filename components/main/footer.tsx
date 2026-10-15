import Link from "next/link";

import { FOOTER_DATA } from "@/constants";

export const Footer = () => {
  return (
    <div className="w-full h-full bg-transparent text-gray-200 shadow-lg p-[15px]">
      <div className="w-full flex flex-col items-center justify-center m-auto">
        <div className="w-full h-full flex flex-row items-center justify-around flex-wrap">
          {FOOTER_DATA.map((column) => (
            <div
              key={column.title}
              className="min-w-[200px] h-auto flex flex-col items-center justify-start"
            >
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-white mb-2">{column.title}</h3>
              {column.data.map(({ icon: Icon, name, link }) => (
                <Link
                  key={`${column.title}-${name}`}
                  href={link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-sans flex flex-row items-center my-2 text-gray-400 hover:text-cyan-300 transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="text-xs sm:text-sm ml-2">{name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="font-sans mt-8 mb-5 text-xs text-center text-gray-500">
          &copy; {new Date().getFullYear()} Ayush Singh. All rights reserved.
        </div>
      </div>
    </div>
  );
};
