Task Collection
===============
**Author: Daniel Brand** \
**Email: <daniel.brand@metech.tu-chemnitz.de>** \
**Date: 09.2024**

This folder contains example task implementations that can be used to quickly replicate/reuse the respective tasks in custom experiments. To use them, copy the respective task-folder (e.g., `crt`) into the tasks-folder of your experiment. The list will be extended over time.

## List of Tasks
- `crt`: Contains the 7-item version of the Cognitive Reflection Task (CRT). Items will be asked one after the other. Based on Toplak et al. (2014)
- `nfc`: Contains a short 4-item version of the Need for Cognition (NFC). The items are visualized as a table of likert scales. Based on Beißert et al. (2015)
- `syllog`: Contains a task that tests all 64 syllogisms in a single-choice design. To alter the list of tested syllogisms (e.g., to split it up for multiple sessions), the `tasks.html` file directly contains a list of the syllogisms to test that can be edited. The syllogisms will be presented with random contents featuring hobbies and professions. Furthermore, at the end, participants will be asked to report how they understand the quantifier *some* (Gricean interpretation). For a comparison of the response formats, see Brand & Ragni. (2023).


## References
- Toplak, M. E., West, R. F., & Stanovich, K. E. (2014). Assessing miserly information processing: An expansion of
the cognitive reflection test. *Thinking & Reasoning*, 20(2), 147-168.
- Beißert, H., Köhler, M., Rempel, M., & Beierlein, C. (2015). Deutschsprachige Kurzskala zur Messung des Konstrukts Need for Cognition NFC-K [German short scale for measuring the construct Need for Cognition NFC-K]. *Zusammenstellung sozialwissenschaftlicher Items und Skalen (ZIS)*.
- Brand, D., & Ragni, M. (2023). Effect of Response Format on Syllogistic Reasoning. In M. Goldwater, F. K. Anggoro, B. K. Hayes, & D. C. Ong (Eds.), *Proceedings of the 45th Annual Meeting of the Cognitive Science Society* (pp. 2408–2414).