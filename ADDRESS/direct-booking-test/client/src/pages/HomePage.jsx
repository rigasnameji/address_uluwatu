import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const fallbackHero = 'https://a0.muscache.com/im/pictures/hosting/Hosting-51414187/original/d262c698-1dcd-474f-9aa0-3406f7908cc5.jpeg';

export default function HomePage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [listing, setListing] = useState(null);

  useEffect(() => {
    const syncHeader = () => setHeaderScrolled(window.scrollY > 12);
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
    return () => window.removeEventListener('scroll', syncHeader);
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/listing')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setListing(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const hero = listing?.picture?.original || listing?.picture?.thumbnail || fallbackHero;
  const title = listing?.title || 'Luxury 9BR Bingin Villa';

  return (
    <main className="home">
      <section className="home-hero">
        <img src={hero} alt="AddressBali villa pool and tropical garden" />
        <div className="home-hero__shade" />
        <nav className={headerScrolled ? 'topbar is-scrolled' : 'topbar'} aria-label="Primary navigation">
          <Link className="brand" to="/">AddressBali</Link>
          <div className="topbar-menu" aria-label="Main menu">
            <Link to="/">Home</Link>
            <Link to="/">Villa</Link>
            <Link to="/">Events</Link>
            <Link to="/">Experiences</Link>
            <Link to="/">Location</Link>
            <Link to="/">FAQ</Link>
            <Link to="/">Contact</Link>
          </div>
          <Link className="nav-cta" to="/booking">Book direct</Link>
        </nav>
        <div className="home-hero__content">
          <p className="eyebrow">Direct booking test</p>
          <h1>{title}</h1>
          <p>
            A private Uluwatu villa booking flow connected to Guesty for live availability, quote totals, and booking
            requests.
          </p>
          <div className="hero-facts" aria-label="Villa highlights">
            <span>{listing?.bedrooms || 9} bedrooms</span>
            <span>{listing?.bathrooms || 9.5} bathrooms</span>
            <span>Up to {listing?.accommodates || 16}+ guests</span>
          </div>
          <Link className="button button--primary" to="/booking">Check dates</Link>
        </div>
      </section>
    </main>
  );
}
