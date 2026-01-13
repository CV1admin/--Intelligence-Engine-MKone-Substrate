
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { InfoPacket, EngineMetrics } from '../types';

interface Props {
  packet: InfoPacket | null;
  metrics: EngineMetrics;
  rfiActive: boolean;
}

const FieldVisualizer: React.FC<Props> = ({ packet, metrics, rfiActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const g = svg.append("g");

    // Background particles
    const particles = d3.range(rfiActive ? 100 : 50).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * (rfiActive ? 3 : 2) + 1,
    }));

    g.selectAll(".particle")
      .data(particles)
      .enter()
      .append("circle")
      .attr("class", "particle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", d3.interpolatePlasma(metrics.coherence))
      .attr("opacity", rfiActive ? 0.6 : 0.3)
      .style("filter", rfiActive ? "blur(1px)" : "none");

    // Recursive mirror engine rings
    const rings = rfiActive ? 8 : 5;
    for (let i = 0; i < rings; i++) {
      g.append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 30 + i * (rfiActive ? 30 : 25) * (1 + metrics.recursion))
        .attr("fill", "none")
        .attr("stroke", d3.interpolateViridis(metrics.diversity))
        .attr("stroke-width", rfiActive ? 2 : 1)
        .attr("stroke-dasharray", rfiActive ? "2,2" : "5,5")
        .attr("opacity", (rings - i) / rings)
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", `0 ${centerX} ${centerY}`)
        .attr("to", `${i % 2 === 0 ? 360 : -360} ${centerX} ${centerY}`)
        .attr("dur", `${10 / (i + 1)}s`)
        .attr("repeatCount", "indefinite");
    }

    // Qualia Vector visualization
    if (packet) {
      const vectorLen = packet.inputVector.length;
      const angleStep = (Math.PI * 2) / vectorLen;
      
      const lineGenerator = d3.lineRadial<number>()
        .angle((_, i) => i * angleStep)
        .radius(d => 50 + d * (rfiActive ? 120 : 80))
        .curve(d3.curveCardinalClosed);

      const path = g.append("path")
        .datum(packet.inputVector)
        .attr("d", lineGenerator as any)
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", d3.interpolateSpectral(metrics.health))
        .attr("fill-opacity", rfiActive ? 0.5 : 0.3)
        .attr("stroke", rfiActive ? "#f472b6" : "#38bdf8")
        .attr("stroke-width", rfiActive ? 4 : 2)
        .style("filter", rfiActive ? "drop-shadow(0 0 8px rgba(244, 114, 182, 0.8))" : "none");

      if (rfiActive) {
        path.append("animate")
          .attr("attributeName", "stroke-width")
          .attr("values", "4;8;4")
          .attr("dur", "0.5s")
          .attr("repeatCount", "indefinite");
      }
    }

    // Mirror Spike lines
    if (rfiActive) {
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12;
        g.append("line")
          .attr("x1", centerX)
          .attr("y1", centerY)
          .attr("x2", centerX + Math.cos(angle) * 300)
          .attr("y2", centerY + Math.sin(angle) * 300)
          .attr("stroke", "#f472b6")
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.2)
          .attr("stroke-dasharray", "10,10");
      }
    }
  }, [packet, metrics, rfiActive]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-slate-950/20 rounded-xl">
      <svg
        ref={svgRef}
        viewBox="0 0 600 400"
        className="w-full h-full max-w-2xl transition-all duration-1000"
      />
    </div>
  );
};

export default FieldVisualizer;
