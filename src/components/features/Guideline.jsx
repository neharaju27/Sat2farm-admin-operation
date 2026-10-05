import { useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

export default function Guideline({ onClose, onBack }) {

  const guidelines = [
    {
      id: 1,
      title: 'pH Requirement',
      content: 'The ideal pH range for carp culture is between 7.5 and 8.0. However, the pH range that\'s generally accepted for fish culture is between 6.5 and 9.0.'
    },
    {
      id: 2,
      title: 'Water Alkalinity',
      content: 'For brood fish, the alkalinity should be between 80 and 150 ppm. The ideal range of total alkalinity for freshwater fish is 60-300 mg/l as CaCO3. For freshwater fish ponds, the total hardness should be greater than 40 mg/l as CaCO3.'
    },
    {
      id: 3,
      title: 'Lime Application',
      content: 'If the pH is less than 7 and alkalinity is less than 80 ppm, apply 200 kg of lime per hectare in the pond.'
    },
    {
      id: 4,
      title: 'Seed Stocking for Nursery Pond',
      subSections: [
        {
          label: 'a. Broodstock management/Selection of healthy yearlings',
          content: 'Selection and maintenance of mature individuals with desirable hereditary qualities like enhanced gonadal development and fecundity for breeding, thus improving the quality and number of offspring. Healthy yearlings without any deformities are selected from different sources to avoid breeding depression and to promote genetic improvement by out-crossing. The broodfish is tagged to ensure breeding between different stocks and to avoid backcross and mating between offspring of the same parent. Tagging of brood helps to identify the source, age, and breeding frequency. It is preferable to replace 30-50% of broodfish every year.'
        },
        {
          label: 'b. Pond Requirement',
          content: 'Before the breeding season, the breeding pond should be prepared by leaving it dry and repairing the dike, inlet, and outlet. Lime should be broadcasted to about 10 kilograms throughout the pond. Rectangular earthen ponds having 0.2-0.5 ha with a water depth of 1.5 m are commonly used to maintain broodstock. Keeping broodfish in raised cement ponds is not advisable, as the wider daily fluctuation of temperature may adversely affect gonad development. The broodstock pond must be free from aquatic weeds or other unwanted fish. The pond is drained once a year and disinfected by chlorination with bleaching powder (35ppm).'
        }
      ]
    },
    {
      id: 5,
      title: 'Selection of Breeding Pair',
      content: 'IMC and silver carp breed during the southwest monsoon, but common carp breed almost throughout the year with two peaks during June to August and January to March. Grass carp spawns during March to August. As carps are sexually dimorphic, the broodfish are segregated according to sex. Secondary sexual characters usually develop during March and broodstock are segregated and kept @ 1000 kg/ha. The mature male is distinguished by the roughness on the dorsal surface of the pectoral fin. The abdomen of the male is comparatively flat, and the vent is not swollen. On applying slight pressure on its belly, milt oozes out. The ripe female of IMC and common carp have soft and bulging abdomen with a swollen pinkish genital opening. The female of Chinese carps is distinguished by visual examination of the ova collected by inserting a catheter through the genital opening. The mature ova measures 1.2-1.3 mm diameter, which has a pale blue color in silver carp and yellow to deep golden brown color in grass carp.'
    },
    {
      id: 6,
      title: 'Spawning',
      note: 'The success of spawning primarily depends on water quality and weather. The optimum water temperature is 26-28°C with drizzling weather. Water containing 5-6 ppm DO (Dissolved Oxygen) promotes spawning and hatching.',
      subSections: [
        {
          label: 'a. Male & Female Selection',
          content: 'Male and female are usually selected in a ratio of 2:1 by number or 1:1 by body weight. The selected broodfish are handled with minimum stress and kept in breeding hapa or breeding pool for about 6 hours. In a breeding pool, never put different species together.'
        },
        {
          label: 'b. Breeding hapa preparation',
          content: 'Breeding hapa is made of fine-meshed net cloth having the size varying from 3.6 m x 1.5 m x 0.9 m to 1.8 m x 0.9 m x 0.9 m depending on the size of the brood. The hapa net is tied to the poles fixed in the water column at both upper and lower corners using laces stitched to it and placed in a fully stretched out condition.\n\nNote: Care should be taken to ensure that the bottom of the hapa is not touching the bottom of the water body, and there should be at least 20 cm height above the water surface.'
        },
        {
          label: 'c. The breeding pool',
          content: 'Is made of cement having 6-12 m diameter. The depth at the periphery is 120 cm and the bottom slopes towards the center. The depth at the center is 150 cm where there is an outlet pipe having 2-3 inch diameter. The wall of the breeding pool is fitted with duck-mouth inlet pipes fitted at an angle of 45° to create circular water flow.'
        },
        {
          label: 'd. The optimum dosage of synthetic hormone',
          content: '1. Catla, Rohu: 0.5 ml/kg Mrigal\n2. Common carp: 0.3 ml/kg\n3. Grass carp, Silver carp: 0.6 ml/kg'
        },
        {
          label: 'e. The size of the needle depends on the weight of the fish',
          content: '1. Below 1-2 kg: Number 24\n2. 2-3 kg: Number 22\n3. Above 3 kg: Number 19'
        }
      ]
    },
    {
      id: 7,
      title: 'After Induced Breeding',
      content: 'After injection, both male and female are kept in hapa or breeding pool at a density of 3-5 kg/m³ for spawning. After 3 hours of injection, circular water current is provided at 0.2-0.5 m/s. An environment free from stress, human and mechanical interference is required for better success rate. Under the influence of hormones and water current, the broodfish starts courtship. Male starts to chase the female with the splashing of water which creates irregular ripples on the water surface.'
    },
    {
      id: 8,
      title: 'Transport of Adult Fish',
      content: 'Transported spawn must be acclimated during cool hours, i.e. morning or evening. Needs attention to avoid any abrupt change in water quality, temperature and pH. Spawn transported in open containers can be acclimatized by gradual addition of pond water whereas closed oxygenated polythene bags are left floating in the pond water for a few minutes. The stocking density in earthen nurseries normally ranges at 30 to 50 lakhs/ha which can be increased to 1 crore/ha depending upon the management.'
    },
    {
      id: 9,
      title: 'Water Quality Management',
      content: 'To operate a hatchery having the capacity to incubate 20-30 lakh eggs at a time, an over-head-tank of 20 t capacity and an open well or a tube-well (20 t/hr yield) with two water pumps and a generator are required. The water should have total alkalinity of 40-100 ppm and iron content of less than 0.4 ppm.'
    },
    {
      id: 10,
      title: 'Clearance of Aquatic Weeds',
      content: 'Weeds not only consume nutrients from the water body resulting in poor plankton and fish production but also pose serious problems in exploitation of fisheries and cause oxygen depletion on cloudy days and when they die and rot. Weeds like Free-floating surface weeds, Emergent weeds, Submerged weeds, Marginal weeds can be controlled by Manual and mechanical method, Chemical method, or Biological method.'
    },
    {
      id: 11,
      title: 'Supplementary Feeding Nursery Pond',
      content: 'Provision of supplementary feed becomes an integral part of management for the optimum nourishment. The nutrient requirements for carp spawn have been evaluated over the years as 35-40% of protein, 4-6% of fat, 22-26% of carbohydrate. The combination of groundnut oil cake (GNOC) and ricebran at 1:1 (w/w) has been most commonly used. Dry feed mixture is normally supplied at 400% of the initial biomass for the first 5 days and 800% of the initial biomass for the subsequent days.'
    },
    {
      id: 12,
      title: 'Stocking Fry for Rearing Pond',
      content: 'Preferably done during morning or evening hours after proper acclimatization to a new environment. In earthen rearing ponds, stocking density of 2-3 lakh fry/ha can be increased in ponds with facilities for water circulation/exchange and/or aeration. Species ratios: Catla: Rohu: Mrigal:: 1:1:1 or 1:2:2 or 3:4:3; Silver carp: Grass carp: Common carp:: 4:3:3 or 1:1:1.'
    },
    {
      id: 13,
      title: 'Supplementary Feeding for Rearing Ponds',
      content: 'Met through available natural foods and provision of supplementary feed, commonly groundnut/mustard oil cake and rice bran/wheat bran at 1:1 ratio by weight. Feed is provided at 8-10% of initial biomass of fry per day during the first month, followed by 6-8% of the standing biomass during subsequent 2 months.'
    },
    {
      id: 14,
      title: 'Stocking for Grow-out Pond',
      content: 'Fingerlings of more than 10 cm constitute best stocking material for grow-out culture. Generally, a density of 5,000-10,000 fingerlings/ha is kept as standard stocking rate in carp polyculture for a production target of 3-5 tonnes/ha/year. With provision of water exchange and aeration, higher targeted fish production levels of 10-15 tonnes/ha/year are achieved.'
    },
    {
      id: 15,
      title: 'Supplementary Feeding for Grow-out Ponds',
      content: 'Among various ingredients, a mixture of groundnut/mustard oilcake and rice-bran at 1:1 has been commonly used along with fortification of vitamins and minerals. The recommended feeding practice is to provide feed at 3-5% of body weight of the initial biomass and subsequently at sliding scale from 3% to 1%.'
    },
    {
      id: 16,
      title: 'Harvesting',
      content: 'Harvesting of fishes is usually done after a culture period of 10 months to one year. However, fishes attaining marketable size can be harvested periodically to reduce the pressure of density on the pond and thereby providing sufficient space for the growth of other fishes.'
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '900px', maxWidth: '95vw', maxHeight: '90vh' }}>
        
        {/* Header */}
        <div className="modal-head">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>
            <ArrowLeft className="ic-xs" />
          </button>
          <h3>Guidelines</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X className="ic-xs" />
          </button>
        </div>

        {/* Body - single scrollable page like the image */}
        <div className="modal-body" style={{ overflowY: 'auto', padding: '24px' }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            padding: '24px',
            border: '1px solid #e5e7eb'
          }}>
            {guidelines.map((guideline) => (
              <div
                key={guideline.id}
                style={{ marginBottom: '24px' }}
              >
                {/* Title */}
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '8px'
                }}>
                  {guideline.id}. {guideline.title}:
                </h3>

                {/* Note (if any) */}
                {guideline.note && (
                  <p style={{
                    fontSize: '14px',
                    color: '#4a5463',
                    lineHeight: '1.7',
                    marginBottom: '12px',
                    paddingLeft: '16px'
                  }}>
                    <strong>Note:</strong> {guideline.note}
                  </p>
                )}

                {/* Simple content */}
                {guideline.content && (
                  <p style={{
                    fontSize: '14px',
                    color: '#4a5463',
                    lineHeight: '1.7',
                    paddingLeft: '16px',
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {guideline.content}
                  </p>
                )}

                {/* Sub-sections */}
                {guideline.subSections && guideline.subSections.map((sub, idx) => (
                  <div key={idx} style={{
                    paddingLeft: '16px',
                    marginBottom: '12px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}>
                      {sub.label}:
                    </p>
                    <p style={{
                      fontSize: '14px',
                      color: '#4a5463',
                      lineHeight: '1.7',
                      paddingLeft: '16px',
                      margin: 0,
                      whiteSpace: 'pre-line'
                    }}>
                      {sub.content}
                    </p>
                  </div>
                ))}

                {/* Divider between sections */}
                {guideline.id < guidelines.length && (
                  <hr style={{
                    border: 'none',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: '20px'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}