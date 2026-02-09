const servicesGrid = document.getElementById("servicesGrid");


const services = [
  {
    id:1,
    name:"Installation & Commissioning",
    description:"Professional installation and commissioning of generators, solar systems, pumps, and industrial equipment ensuring safe and optimal operation.",
    price:1500000,
    formLink:"serviceForm.html"
  },
  {
    id:2,
    name:"Preventive Maintenance",
    description:"Scheduled maintenance to keep your equipment running efficiently, prevent breakdowns, and extend operational life.",
    price:850000,
    formLink:"serviceForm.html"
  },
  {
    id:3,
    name:"Power Audits",
    description:"Comprehensive power audits to analyze consumption, efficiency, and identify areas for cost savings and energy optimization.",
    price:650000,
    formLink:"serviceForm.html"
  },
  {
    id:4,
    name:"Technical Support & Training",
    description:"Expert support and hands-on training for your staff to operate, troubleshoot, and maintain industrial equipment safely and efficiently.",
    price:450000,
    formLink:"serviceForm.html"
  },
  {
    id:5,
    name:"Equipment Upgrades & Retrofits",
    description:"Upgrade and retrofit existing machinery or electrical systems to modern standards for improved performance and safety.",
    price:1200000,
    formLink:"serviceForm.html"
  },
  {
    id:6,
    name:"Industrial Automation Solutions",
    description:"Design and implementation of automation systems for production lines, reducing manual labor and increasing efficiency.",
    price:2500000,
    formLink:"serviceForm.html"
  },
  {
    id:7,
    name:"Emergency Repairs",
    description:"Rapid response repair services for generators, pumps, and industrial equipment to minimize downtime.",
    price:950000,
    formLink:"serviceForm.html"
  },
  {
    id:8,
    name:"Site Surveys & Feasibility Studies",
    description:"Detailed site surveys and feasibility studies for energy, construction, and industrial projects.",
    price:750000,
    formLink:"serviceForm.html"
  },
  {
    id:9,
    name:"Custom Engineering Solutions",
    description:"Tailored engineering solutions to meet specific industrial and commercial requirements.",
    price:3000000,
    formLink:"serviceForm.html"
  }
];


function displayServices(){
  servicesGrid.innerHTML = "";

  services.forEach(service => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <p class="price">₦${service.price.toLocaleString()}</p>
      <button onclick="window.location.href='${service.formLink}?service=${encodeURIComponent(service.name)}'">
        Apply for Service
      </button>
    `;

    servicesGrid.appendChild(card);
  });
}

displayServices();
