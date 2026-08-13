import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/constants";

export function FaqSection() {
  return (
    <section id="faq" className="bg-background py-20">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-center text-section text-foreground">Perguntas frequentes</h2>

        <Accordion type="single" collapsible className="mt-10">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.pergunta} value={item.pergunta}>
              <AccordionTrigger>{item.pergunta}</AccordionTrigger>
              <AccordionContent>{item.resposta}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
